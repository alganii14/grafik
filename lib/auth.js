const COOKIE_NAME = 'dpk_auth';
const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;
const DEFAULT_AUTH_SECRET = 'dpk-insight-vercel-default-secret-change-in-settings';

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeText(value) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function decodeText(value) {
  return new TextDecoder().decode(base64UrlToBytes(value));
}

function authSecret() {
  return process.env.DPK_AUTH_SECRET || DEFAULT_AUTH_SECRET;
}

async function signature(value) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(authSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signed));
}

export function safeEqual(first, second) {
  const left = String(first);
  const right = String(second);
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return difference === 0;
}

export function expectedCredentials() {
  return {
    username: process.env.DPK_AUTH_USERNAME || 'admin',
    password: process.env.DPK_AUTH_PASSWORD || 'Dpk@2026',
  };
}

export async function createAuthToken(username) {
  const payload = encodeText(JSON.stringify({
    user: username,
    exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
  }));
  return `${payload}.${await signature(payload)}`;
}

export async function verifyAuthToken(token) {
  try {
    if (!token || !token.includes('.')) return null;
    const [payload, providedSignature] = token.split('.');
    if (!safeEqual(providedSignature, await signature(payload))) return null;

    const data = JSON.parse(decodeText(payload));
    if (!data.user || !data.exp || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function readAuthCookie(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map((item) => item.trim());
  const entry = cookies.find((item) => item.startsWith(`${COOKIE_NAME}=`));
  return entry ? decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)) : '';
}

export function authCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${TOKEN_LIFETIME_SECONDS}`;
}

export function expiredAuthCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}
