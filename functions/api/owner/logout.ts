import { clearOwnerCookie, isOwnerAuthenticated, json, type PagesContext } from '../../_shared';

export const onRequestPost = async ({ request, env }: PagesContext) => {
  if (!(await isOwnerAuthenticated(request, env.OWNER_PHOTO_PASSWORD))) return json({ error: 'Owner authentication required.' }, 401);
  return json({ success: true }, 200, { 'Set-Cookie': clearOwnerCookie });
};
