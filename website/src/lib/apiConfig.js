/** Default live API — no Vercel env vars required. Override locally via .env.local */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://backend.delicod.com/api';

/** Origin without /api — used for image/static paths from the backend */
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');
