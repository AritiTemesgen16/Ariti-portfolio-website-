import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '100kb' }));

  // Security Headers Middleware
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // In-memory rate limiting map for contact form (max 5 requests per 15 minutes per IP)
  const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>();

  // API Routes
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      developer: 'Ariti Temesgen Wayu',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Contact Form Submission Endpoint with Resend Email Integration
  app.post('/api/contact', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const ipKey = String(clientIp);
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes

    // Check rate limit
    const rateData = ipRateLimitMap.get(ipKey);
    if (rateData && now < rateData.resetTime) {
      if (rateData.count >= 5) {
        res.status(429).json({ error: 'Too many contact requests from this IP. Please try again in 15 minutes.' });
        return;
      }
      rateData.count += 1;
    } else {
      ipRateLimitMap.set(ipKey, { count: 1, resetTime: now + windowMs });
    }

    const { name, email, company, serviceType, budget, timeline, message, additionalInfo, honeypot } = req.body || {};

    // Anti-spam Honeypot Check
    if (honeypot) {
      // Quietly accept to confuse bots without logging lead
      res.status(200).json({ success: true, message: 'Message sent successfully.' });
      return;
    }

    // Input Sanitization and Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      res.status(400).json({ error: 'Please provide a valid name between 2 and 100 characters.' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.') || email.length > 150) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 2000) {
      res.status(400).json({ error: 'Please enter a message between 10 and 2000 characters.' });
      return;
    }

    const leadRecord = {
      id: `lead_${Date.now()}`,
      name: name.trim().slice(0, 100),
      email: email.trim().slice(0, 150),
      company: company && String(company).trim() ? String(company).trim().slice(0, 150) : 'N/A',
      serviceType: serviceType && String(serviceType).trim() ? String(serviceType).trim().slice(0, 100) : 'General Inquiry',
      budget: budget && String(budget).trim() ? String(budget).trim().slice(0, 100) : 'Flexible',
      timeline: timeline && String(timeline).trim() ? String(timeline).trim().slice(0, 100) : 'Flexible',
      message: message.trim().slice(0, 2000),
      additionalInfo: additionalInfo && String(additionalInfo).trim() ? String(additionalInfo).trim().slice(0, 1000) : 'None provided',
      receivedAt: new Date().toISOString()
    };

    console.log('[LEAD RECORD CREATED]', JSON.stringify(leadRecord, null, 2));

    const emailBodyText = `NEW PROJECT INQUIRY

Name: ${leadRecord.name}
Email: ${leadRecord.email}
Company: ${leadRecord.company}
Project type: ${leadRecord.serviceType}
Budget: ${leadRecord.budget}
Timeline: ${leadRecord.timeline}

Project description:
${leadRecord.message}

Additional information:
${leadRecord.additionalInfo}`;

    const resendApiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
    const contactDestination = process.env.CONTACT_EMAIL || 'arititemesgen16@gmail.com';

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const { data, error } = await resend.emails.send({
          from: 'Portfolio Inquiries <onboarding@resend.dev>',
          to: [contactDestination],
          replyTo: leadRecord.email,
          subject: `NEW PROJECT INQUIRY: ${leadRecord.serviceType} from ${leadRecord.name}`,
          text: emailBodyText,
        });

        if (error) {
          console.error('[EMAIL DELIVERY ERROR]', error);
          res.status(500).json({
            error: `Unable to deliver email at this time. Please contact Ariti directly at ${contactDestination}.`
          });
          return;
        }

        console.log('[EMAIL DELIVERED VIA RESEND]', data);
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : String(err);
        console.error('[EMAIL EXCEPTION]', errMessage);
        res.status(500).json({
          error: `Unable to deliver email at this time. Please contact Ariti directly at ${contactDestination}.`
        });
        return;
      }
    } else {
      // Development mode fallback when no API key is provided
      console.log('[DEV MODE: NO EMAIL API KEY CONFIGURED]');
      console.log(`[DEV SIMULATED EMAIL TO ${contactDestination}]:\n${emailBodyText}`);

      if (process.env.NODE_ENV === 'production') {
        res.status(500).json({
          error: `Email service is not configured on the server. Please contact Ariti directly at ${contactDestination}.`
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: `Thank you ${leadRecord.name}. Your message has been sent successfully! Ariti will reply to ${leadRecord.email} within 24 hours.`,
      referenceId: leadRecord.id
    });
  });

  // Dynamic Sitemap XML for SEO
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    const baseUrl = process.env.APP_URL || 'https://arititemesgen.dev';
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/projects</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/projects/smartspend</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/projects/agriconnect-ethiopia</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/projects/pharmacore-ethiopia</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // Robots.txt for Search Engines
  app.get('/robots.txt', (_req: Request, res: Response) => {
    const baseUrl = process.env.APP_URL || 'https://arititemesgen.dev';
    const robots = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(robots);
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
