import { DEFAULT_PHOTO_PATH, LIVE_PROFILE_PHOTO_URL, type PagesContext } from '../../_shared';

export const onRequestGet = ({ request, env }: PagesContext) => {
  const source = request.url.includes('default=1') ? DEFAULT_PHOTO_PATH : (env.PROFILE_PHOTO_URL || LIVE_PROFILE_PHOTO_URL);
  return Response.redirect(new URL(source, request.url), 302);
};
