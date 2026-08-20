import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import { v2 as cloudinary } from 'cloudinary';

// Profile Photo Storage
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'profile');
const MANIFEST_PATH = path.join(UPLOADS_DIR, 'manifest.json');
const DEFAULT_PHOTO_PATH = '/src/assets/images/ariti_actual_white_suit_studio_1786201703704.jpg';
const CLOUDINARY_PROFILE_ID = 'ariti-profile/profile';

interface ProfilePhotoManifest {
  activeFilename: string | null;
  originalName: string | null;
  mimeType: string | null;
  updatedAt: number;
}

function ensureUploadsDirectory() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function readManifest(): ProfilePhotoManifest {
  try {
    ensureUploadsDirectory();
    if (fs.existsSync(MANIFEST_PATH)) return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch (err) {
    console.error('[PROFILE PHOTO MANIFEST READ ERROR]', err);
  }
  return { activeFilename: null, originalName: null, mimeType: null, updatedAt: 0 };
}

function writeManifest(manifest: ProfilePhotoManifest) {
  ensureUploadsDirectory();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const ownerSessions = new Map<string, number>();
const ownerLoginAttempts = new Map<string, { count: number; resetTime: number }>();
const SESSION_TTL_MS = 60 * 60 * 1000;

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie || '';
  return Object.fromEntries(header.split(';').map(part => {
    const index = part.indexOf('=');
    if (index === -1) return ['', ''];
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(([key]) => key));
}

function isOwnerAuthenticated(req: Request): boolean {
  const token = parseCookies(req).owner_session;
  if (!token) return false;
  const expiresAt = ownerSessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() >= expiresAt) {
    ownerSessions.delete(token);
    return false;
  }
  return true;
}

function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (!isOwnerAuthenticated(req)) {
    res.status(401).json({ error: 'Owner authentication required.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json({ limit: '10mb' }));

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>();

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', developer: 'Ariti Temesgen Wayu', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV || 'development' });
  });

  // Owner-only profile management session
  app.post('/api/owner/login', (req: Request, res: Response) => {
    const configuredPassword = process.env.OWNER_PHOTO_PASSWORD;
    if (!configuredPassword) {
      res.status(503).json({ error: 'Owner photo management is not configured yet.' });
      return;
    }

    const ip = String(req.ip || req.headers['x-forwarded-for'] || 'unknown');
    const now = Date.now();
    const attempt = ownerLoginAttempts.get(ip);
    if (attempt && now < attempt.resetTime && attempt.count >= 5) {
      res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
      return;
    }
    if (!attempt || now >= attempt.resetTime) ownerLoginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    else attempt.count += 1;

    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const supplied = Buffer.from(password);
    const expected = Buffer.from(configuredPassword);
    const valid = supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
    if (!valid) {
      res.status(401).json({ error: 'Invalid owner password.' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    ownerSessions.set(token, now + SESSION_TTL_MS);
    res.setHeader('Set-Cookie', `owner_session=${token}; HttpOnly; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}Path=/; Max-Age=3600`);
    res.json({ success: true, expiresIn: SESSION_TTL_MS / 1000 });
  });

  app.post('/api/owner/logout', requireOwner, (req: Request, res: Response) => {
    const token = parseCookies(req).owner_session;
    if (token) ownerSessions.delete(token);
    res.setHeader('Set-Cookie', 'owner_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    res.json({ success: true });
  });

  app.get('/api/owner/session', (req: Request, res: Response) => {
    res.json({ authenticated: isOwnerAuthenticated(req) });
  });

  // Public profile-photo endpoint. Cloudinary is the persistent source when configured.
  app.get('/api/profile-photo/active', (_req: Request, res: Response) => {
    if (cloudinaryConfigured) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${CLOUDINARY_PROFILE_ID}`;
      res.json({ success: true, url: `${url}?v=${Date.now()}`, isCustom: true, updatedAt: Date.now() });
      return;
    }

    const manifest = readManifest();
    if (manifest.activeFilename) {
      const filePath = path.join(UPLOADS_DIR, manifest.activeFilename);
      if (fs.existsSync(filePath)) {
        res.json({ success: true, url: `/api/profile-photo/image?t=${manifest.updatedAt}`, isCustom: true, updatedAt: manifest.updatedAt });
        return;
      }
    }
    res.json({ success: true, url: DEFAULT_PHOTO_PATH, isCustom: false, updatedAt: 0 });
  });

  app.get('/api/profile-photo/image', (_req: Request, res: Response) => {
    const manifest = readManifest();
    if (manifest.activeFilename) {
      const filePath = path.join(UPLOADS_DIR, manifest.activeFilename);
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', manifest.mimeType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.sendFile(filePath);
        return;
      }
    }
    const defaultDiskPath = path.join(process.cwd(), 'src/assets/images/ariti_actual_white_suit_studio_1786201703704.jpg');
    if (fs.existsSync(defaultDiskPath)) res.sendFile(defaultDiskPath);
    else res.redirect(DEFAULT_PHOTO_PATH);
  });

  // Upload is authenticated and persistent through Cloudinary.
  app.post('/api/profile-photo', requireOwner, async (req: Request, res: Response) => {
    if (!cloudinaryConfigured) {
      res.status(503).json({ error: 'Persistent photo storage is not configured. Add the Cloudinary environment variables in Render.' });
      return;
    }
    try {
      const { imageBase64, mimeType, fileName } = req.body || {};
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const cleanMimeType = String(mimeType || '').toLowerCase().trim();
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'Image content is required.' });
        return;
      }
      if (!allowedMimeTypes.includes(cleanMimeType)) {
        res.status(400).json({ error: 'Unsupported image format. Allowed formats: JPEG, PNG, WebP, GIF.' });
        return;
      }
      const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
        res.status(400).json({ error: 'Image must be between 1 byte and 5 MB.' });
        return;
      }

      const uploadResult = await cloudinary.uploader.upload(`data:${cleanMimeType};base64,${base64Data}`, {
        public_id: CLOUDINARY_PROFILE_ID,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        folder: 'ariti-profile',
        tags: ['portfolio-profile-photo'],
      });

      const timestamp = Date.now();
      writeManifest({
        activeFilename: null,
        originalName: fileName ? String(fileName).slice(0, 100) : 'profile_photo',
        mimeType: cleanMimeType,
        updatedAt: timestamp,
      });

      res.json({ success: true, message: 'Profile photo saved permanently.', url: `${uploadResult.secure_url}?v=${timestamp}`, isCustom: true, updatedAt: timestamp });
    } catch (err: unknown) {
      console.error('[CLOUDINARY PROFILE PHOTO UPLOAD ERROR]', err instanceof Error ? err.message : String(err));
      res.status(500).json({ error: 'Unable to save profile photo. Please try again.' });
    }
  });

  app.put('/api/profile-photo', requireOwner, (_req: Request, res: Response) => {
    res.status(405).json({ error: 'Use the profile photo upload action to replace the image.' });
  });

  app.patch('/api/profile-photo', requireOwner, (_req: Request, res: Response) => {
    res.status(405).json({ error: 'Use the profile photo upload action to replace the image.' });
  });

  app.delete('/api/profile-photo', requireOwner, async (_req: Request, res: Response) => {
    if (!cloudinaryConfigured) {
      res.status(503).json({ error: 'Persistent photo storage is not configured.' });
      return;
    }
    try {
      await cloudinary.uploader.destroy(CLOUDINARY_PROFILE_ID, { resource_type: 'image', invalidate: true });
      res.json({ success: true, message: 'Profile photo removed. The portfolio will use its default image.', url: DEFAULT_PHOTO_PATH, isCustom: false, updatedAt: Date.now() });
    } catch (err: unknown) {
      console.error('[CLOUDINARY PROFILE PHOTO DELETE ERROR]', err instanceof Error ? err.message : String(err));
      res.status(500).json({ error: 'Unable to remove profile photo.' });
    }
  });

  // Contact Form Submission Endpoint with Resend Email Integration
  app.post('/api/contact', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const ipKey = String(clientIp);
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const rateData = ipRateLimitMap.get(ipKey);
    if (rateData && now < rateData.resetTime) {
      if (rateData.count >= 5) { res.status(429).json({ error: 'Too many contact requests from this IP. Please try again in 15 minutes.' }); return; }
      rateData.count += 1;
    } else ipRateLimitMap.set(ipKey, { count: 1, resetTime: now + windowMs });

    const { name, email, company, serviceType, budget, timeline, message, additionalInfo, honeypot } = req.body || {};
    if (honeypot) { res.status(200).json({ success: true, message: 'Message sent successfully.' }); return; }
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) { res.status(400).json({ error: 'Please provide a valid name between 2 and 100 characters.' }); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.length > 150) { res.status(400).json({ error: 'Please provide a valid email address.' }); return; }
    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 2000) { res.status(400).json({ error: 'Please enter a message between 10 and 2000 characters.' }); return; }

    const leadRecord = {
      id: `lead_${Date.now()}`, name: name.trim().slice(0, 100), email: email.trim().slice(0, 150),
      company: company && String(company).trim() ? String(company).trim().slice(0, 150) : 'N/A',
      serviceType: serviceType && String(serviceType).trim() ? String(serviceType).trim().slice(0, 100) : 'General Inquiry',
      budget: budget && String(budget).trim() ? String(budget).trim().slice(0, 100) : 'Flexible',
      timeline: timeline && String(timeline).trim() ? String(timeline).trim().slice(0, 100) : 'Flexible',
      message: message.trim().slice(0, 2000),
      additionalInfo: additionalInfo && String(additionalInfo).trim() ? String(additionalInfo).trim().slice(0, 1000) : 'None provided',
      receivedAt: new Date().toISOString()
    };
    console.log('[LEAD RECORD CREATED]', JSON.stringify(leadRecord, null, 2));

    const emailBodyText = `NEW PROJECT INQUIRY\n\nName: ${leadRecord.name}\nEmail: ${leadRecord.email}\nCompany: ${leadRecord.company}\nProject type: ${leadRecord.serviceType}\nBudget: ${leadRecord.budget}\nTimeline: ${leadRecord.timeline}\n\nProject description:\n${leadRecord.message}\n\nAdditional information:\n${leadRecord.additionalInfo}`;
    const isProduction = process.env.NODE_ENV === 'production';
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactDestination = process.env.CONTACT_EMAIL;
    if (isProduction && (!resendApiKey || !contactDestination)) { res.status(500).json({ error: 'Unable to deliver message at this time. Please try again later or contact me directly.' }); return; }
    const recipientEmail = contactDestination || 'arititemesgen16@gmail.com';

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const { data, error } = await resend.emails.send({ from: 'Portfolio Inquiries <onboarding@resend.dev>', to: [recipientEmail], replyTo: leadRecord.email, subject: `NEW PROJECT INQUIRY: ${leadRecord.serviceType} from ${leadRecord.name}`, text: emailBodyText });
        if (error) { console.error('[EMAIL DELIVERY ERROR]', error); res.status(500).json({ error: 'Unable to deliver message at this time. Please try again later or contact me directly.' }); return; }
        console.log('[EMAIL DELIVERED VIA RESEND]', data);
      } catch (err: unknown) {
        console.error('[EMAIL EXCEPTION]', err instanceof Error ? err.message : String(err));
        res.status(500).json({ error: 'Unable to deliver message at this time. Please try again later or contact me directly.' }); return;
      }
    } else console.log('[DEV MODE: NO RESEND_API_KEY CONFIGURED]', `Simulated email to ${recipientEmail}:\n${emailBodyText}`);

    res.status(200).json({ success: true, message: `Thank you ${leadRecord.name}. Your message has been sent successfully! Ariti will reply to ${leadRecord.email} within 24 hours.`, referenceId: leadRecord.id });
  });

  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    const baseUrl = 'https://arititemesgen.com';
    const today = new Date().toISOString().split('T')[0];
    const pages = [
      ['/', 'weekly', '1.0'], ['/projects', 'weekly', '0.9'], ['/projects/smartspend', 'monthly', '0.8'],
      ['/projects/agriconnect-ethiopia', 'monthly', '0.8'], ['/projects/pharmacore-ethiopia', 'monthly', '0.8'],
      ['/services', 'monthly', '0.8'], ['/about', 'monthly', '0.7'], ['/contact', 'monthly', '0.9']
    ];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(([url, changefreq, priority]) => `  <url>\n    <loc>${baseUrl}${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`).join('\n')}\n</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'no-store, max-age=0');
    res.send(sitemap);
  });

  app.get('/robots.txt', (_req: Request, res: Response) => {
    res.header('Content-Type', 'text/plain');
    res.send('User-agent: *\nAllow: /\n\nSitemap: https://arititemesgen.com/sitemap.xml\n');
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on http://0.0.0.0:${PORT}`));
}

startServer();
