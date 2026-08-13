import { expiredAuthCookie } from '../lib/auth.js';

export function POST() {
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Set-Cookie': expiredAuthCookie(),
      },
    },
  );
}

export function GET() {
  return Response.json({ message: 'Method tidak diizinkan.' }, { status: 405 });
}
