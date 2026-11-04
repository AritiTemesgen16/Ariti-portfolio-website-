import { DEFAULT_PHOTO_PATH, destroyCloudinary, isOwnerAuthenticated, json, uploadCloudinary, type PagesContext } from '../_shared';

const requireOwner = async ({ request, env }: PagesContext) => {
  if (!(await isOwnerAuthenticated(request, env.OWNER_PHOTO_PASSWORD))) return json({ error: 'Owner authentication required.' }, 401);
  return null;
};

export const onRequest = async (context: PagesContext) => {
  const denied = await requireOwner(context);
  if (denied) return denied;
  if (context.request.method === 'PUT' || context.request.method === 'PATCH') return json({ error: 'Use the profile photo upload action to replace the image.' }, 405);
  if (context.request.method === 'DELETE') {
    if (!context.env.CLOUDINARY_CLOUD_NAME || !context.env.CLOUDINARY_API_KEY || !context.env.CLOUDINARY_API_SECRET) return json({ error: 'Persistent photo storage is not configured.' }, 503);
    try {
      const result = await destroyCloudinary(context.env);
      if (result?.result !== 'ok') return json({ error: 'Profile photo was not found in persistent storage.' }, 404);
      return json({ success: true, message: 'Profile photo removed. The portfolio will use its default image.', url: DEFAULT_PHOTO_PATH, isCustom: false, updatedAt: Date.now() });
    } catch { return json({ error: 'Unable to remove profile photo.' }, 500); }
  }
  if (context.request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (!context.env.CLOUDINARY_CLOUD_NAME || !context.env.CLOUDINARY_API_KEY || !context.env.CLOUDINARY_API_SECRET) return json({ error: 'Persistent photo storage is not configured. Add the Cloudinary environment variables in Cloudflare.' }, 503);
  try {
    const { imageBase64, mimeType, fileName } = await context.request.json() as { imageBase64?: unknown; mimeType?: unknown; fileName?: unknown };
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const cleanMimeType = String(mimeType || '').toLowerCase().trim();
    if (!imageBase64 || typeof imageBase64 !== 'string') return json({ error: 'Image content is required.' }, 400);
    if (!allowedMimeTypes.includes(cleanMimeType)) return json({ error: 'Unsupported image format. Allowed formats: JPEG, PNG, WebP, GIF.' }, 400);
    const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
    const size = Math.floor((base64Data.length * 3) / 4);
    if (!size || size > 5 * 1024 * 1024) return json({ error: 'Image must be between 1 byte and 5 MB.' }, 400);
    const uploadResult = await uploadCloudinary(context.env, base64Data, cleanMimeType, typeof fileName === 'string' ? fileName : undefined);
    if (!uploadResult) return json({ error: 'Persistent photo storage is not configured. Add the Cloudinary environment variables in Cloudflare.' }, 503);
    const timestamp = Date.now();
    return json({ success: true, message: 'Profile photo saved permanently.', url: `${uploadResult.secure_url}?v=${timestamp}`, isCustom: true, updatedAt: timestamp });
  } catch { return json({ error: 'Unable to save profile photo. Please try again.' }, 500); }
};
