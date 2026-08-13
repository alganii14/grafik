import { readAuthCookie, verifyAuthToken } from '../lib/auth.js';

export async function GET(request) {
  const session = await verifyAuthToken(readAuthCookie(request));
  if (!session) {
    return Response.json(
      { message: 'Sesi tidak valid.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return Response.json(
    { user: session.user },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
