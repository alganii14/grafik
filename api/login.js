import {
  authCookie,
  createAuthToken,
  expectedCredentials,
  safeEqual,
} from '../lib/auth.js';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  if (!username || !password) {
    return Response.json({ message: 'Username dan password wajib diisi.' }, { status: 400 });
  }

  const expected = expectedCredentials();
  if (!safeEqual(username, expected.username) || !safeEqual(password, expected.password)) {
    return Response.json({ message: 'Username atau password tidak sesuai.' }, { status: 401 });
  }

  const token = await createAuthToken(username);
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Set-Cookie': authCookie(token),
      },
    },
  );
}

export function GET() {
  return Response.json({ message: 'Method tidak diizinkan.' }, { status: 405 });
}
