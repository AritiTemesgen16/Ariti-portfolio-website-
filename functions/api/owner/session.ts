import { isOwnerAuthenticated, json, type PagesContext } from '../../_shared';

export const onRequestGet = async ({ request, env }: PagesContext) =>
  json({ authenticated: await isOwnerAuthenticated(request, env.OWNER_PHOTO_PASSWORD) });
