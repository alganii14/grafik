import { next } from '@vercel/functions';
import { readAuthCookie, verifyAuthToken } from './lib/auth.js';

export const config = {
  matcher: ['/dashboard', '/dashboard.html'],
};

export default async function authenticationMiddleware(request) {
  const session = await verifyAuthToken(readAuthCookie(request));
  if (!session) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('auth', 'required');
    return Response.redirect(loginUrl, 302);
  }

  return next();
}
