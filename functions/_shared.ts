export interface Env {
  RESEND_API_KEY?: string;
  CONTACT_EMAIL?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  OWNER_PHOTO_PASSWORD?: string;
  PROFILE_PHOTO_URL?: string;
  NODE_ENV?: string;
}

export type PagesContext = { request: Request; env: Env };

export const DEFAULT_PHOTO_PATH = '/profile-default.jpg';
export const CLOUDINARY_PROFILE_ID = 'ariti-profile/profile';
export const LIVE_PROFILE_PHOTO_URL = 'https://res.cloudinary.com/kbbdtc2q/image/upload/v1787223507/ariti-profile/ariti-profile/profile.jpg?v=1787223507';

export const json = (body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });

export function parseCookies(request: Request): Record<string, string> {
  const header = request.headers.get('Cookie') || '';
  return Object.fromEntries(header.split(';').map((part) => {
    const index = part.indexOf('=');
    if (index === -1) return ['', ''];
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(([key]) => key));
}

const encoder = new TextEncoder();
const toBase64Url = (bytes: ArrayBuffer | Uint8Array) => {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  array.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

export async function createOwnerSession(password: string) {
  const expiresAt = Date.now() + 60 * 60 * 1000;
  const payload = `${expiresAt}.${crypto.randomUUID()}`;
  return `${payload}.${toBase64Url(await hmac(payload, password))}`;
}

export async function isOwnerAuthenticated(request: Request, password?: string) {
  if (!password) return false;
  const token = parseCookies(request).owner_session;
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length < 3) return false;
  const signature = parts.pop() as string;
  const payload = parts.join('.');
  const expiresAt = Number(parts[0]);
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  try { return await crypto.subtle.verify('HMAC', key, fromBase64Url(signature), encoder.encode(payload)); } catch { return false; }
}

export const ownerCookie = (token: string) => `owner_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Secure; Path=/; Max-Age=3600`;
export const clearOwnerCookie = 'owner_session=; HttpOnly; SameSite=Strict; Secure; Path=/; Max-Age=0';

function cloudinaryConfigured(env: Env) {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

function sha1Hex(value: string) {
  return crypto.subtle.digest('SHA-1', encoder.encode(value)).then((digest) => Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join(''));
}

export async function getCloudinaryProfile(env: Env): Promise<{ url: string; version?: number } | null> {
  if (!cloudinaryConfigured(env)) return null;
  const endpoint = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/resources/image/upload?public_ids[]=${encodeURIComponent(CLOUDINARY_PROFILE_ID)}`;
  const auth = btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`);
  const response = await fetch(endpoint, { headers: { Authorization: `Basic ${auth}` } });
  if (!response.ok) return null;
  const data = await response.json() as { resources?: Array<{ secure_url?: string; version?: number }> };
  const resource = data.resources?.[0];
  return resource?.secure_url ? { url: resource.secure_url, version: resource.version } : null;
}

export async function uploadCloudinary(env: Env, base64Data: string, mimeType: string, fileName?: string) {
  if (!cloudinaryConfigured(env)) return null;
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string> = {
    folder: 'ariti-profile',
    invalidate: 'true',
    overwrite: 'true',
    public_id: CLOUDINARY_PROFILE_ID,
    tags: 'portfolio-profile-photo',
    timestamp: String(timestamp),
  };
  const signature = await sha1Hex(`${Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&')}${env.CLOUDINARY_API_SECRET}`);
  const form = new FormData();
  form.append('file', `data:${mimeType};base64,${base64Data}`);
  Object.entries(params).forEach(([key, value]) => form.append(key, value));
  form.append('api_key', env.CLOUDINARY_API_KEY as string);
  form.append('signature', signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
  if (!response.ok) throw new Error('Cloudinary upload failed');
  return await response.json() as { secure_url: string; version?: number };
}

export async function destroyCloudinary(env: Env) {
  if (!cloudinaryConfigured(env)) return null;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { invalidate: 'true', public_id: CLOUDINARY_PROFILE_ID, timestamp: String(timestamp) };
  const signature = await sha1Hex(`${Object.keys(params).sort().map((key) => `${key}=${params[key as keyof typeof params]}`).join('&')}${env.CLOUDINARY_API_SECRET}`);
  const form = new FormData();
  Object.entries(params).forEach(([key, value]) => form.append(key, value));
  form.append('api_key', env.CLOUDINARY_API_KEY as string);
  form.append('signature', signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`, { method: 'POST', body: form });
  if (!response.ok) throw new Error('Cloudinary delete failed');
  return await response.json() as { result?: string };
}
