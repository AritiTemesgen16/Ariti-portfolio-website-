import { json, type PagesContext } from '../_shared';

export const onRequestGet = ({ env }: PagesContext) => json({
  status: 'ok',
  developer: 'Ariti Temesgen Wayu',
  timestamp: new Date().toISOString(),
  environment: env.NODE_ENV || 'production',
});
