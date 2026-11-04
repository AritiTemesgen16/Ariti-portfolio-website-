import { DEFAULT_PHOTO_PATH, getCloudinaryProfile, json, LIVE_PROFILE_PHOTO_URL, type PagesContext } from '../../_shared';

export const onRequestGet = async ({ env }: PagesContext) => {
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    try {
      const resource = await getCloudinaryProfile(env);
      if (resource) {
        const version = resource.version || Date.now();
        return json({ success: true, url: `${resource.url}${resource.url.includes('?') ? '&' : '?'}v=${version}`, isCustom: true, updatedAt: Date.now() }, 200, { 'Cache-Control': 'no-cache, no-store, must-revalidate' });
      }
    } catch { /* fall through to the preserved live URL */ }
  }
  return json({ success: true, url: env.PROFILE_PHOTO_URL || LIVE_PROFILE_PHOTO_URL || DEFAULT_PHOTO_PATH, isCustom: true, updatedAt: Date.now() }, 200, { 'Cache-Control': 'no-cache, no-store, must-revalidate' });
};
