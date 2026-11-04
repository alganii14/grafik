import {
  authCookie,
  createAuthToken,
  authenticateUser,
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

  const account = authenticateUser(username, password);
  if (!account) {
    return Response.json({ message: 'Username atau password tidak sesuai.' }, { status: 401 });
  }

  const token = await createAuthToken(account.username, account.role);
  return Response.json(
    { ok: true, user: account.username, role: account.role, displayName: account.displayName },
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
