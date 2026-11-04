import { createOwnerSession, json, ownerCookie, type PagesContext } from '../../_shared';

const attempts = new Map<string, { count: number; resetTime: number }>();

export const onRequestPost = async ({ request, env }: PagesContext) => {
  if (!env.OWNER_PHOTO_PASSWORD) return json({ error: 'Owner photo management is not configured yet.' }, 503);
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  const now = Date.now();
  const attempt = attempts.get(ip);
  if (attempt && now < attempt.resetTime && attempt.count >= 5) return json({ error: 'Too many login attempts. Please try again later.' }, 429);
  if (!attempt || now >= attempt.resetTime) attempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
  else attempt.count += 1;
  let password = '';
  try { password = String((await request.json() as { password?: unknown }).password || ''); } catch { return json({ error: 'Invalid owner password.' }, 401); }
  if (password !== env.OWNER_PHOTO_PASSWORD) return json({ error: 'Invalid owner password.' }, 401);
  const token = await createOwnerSession(env.OWNER_PHOTO_PASSWORD);
  return json({ success: true, expiresIn: 3600 }, 200, { 'Set-Cookie': ownerCookie(token) });
};
