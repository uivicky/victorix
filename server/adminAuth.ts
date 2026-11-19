import crypto from 'crypto';
import type { Request, Response, NextFunction, CookieOptions } from 'express';

export const ADMIN_COOKIE_NAME = 'victorix_admin_session';
export const DEFAULT_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminSessionPayload {
  sub: 'admin';
  name: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
}

// Bounded in-memory JTI revocation guard (stateless HMAC + exp handles serverless/restarts)
const revokedJtis = new Map<string, number>();

function pruneRevokedJtis(): void {
  const now = Date.now();
  for (const [jti, exp] of revokedJtis.entries()) {
    if (exp <= now) {
      revokedJtis.delete(jti);
    }
  }
  if (revokedJtis.size > 2000) {
    const keys = Array.from(revokedJtis.keys()).slice(0, revokedJtis.size - 1000);
    for (const k of keys) revokedJtis.delete(k);
  }
}

export function getAuthConfig(): {
  passphrase: string;
  sessionSecret: string;
  configured: boolean;
  missingKeys: string[];
} {
  const passphrase = (process.env.ADMIN_PASSPHRASE || '').trim();
  const sessionSecret = (process.env.ADMIN_SESSION_SECRET || '').trim();

  const missingKeys: string[] = [];
  if (!passphrase || passphrase === 'CHANGE_ME_ADMIN_PASSPHRASE') {
    missingKeys.push('ADMIN_PASSPHRASE');
  }
  if (
    !sessionSecret ||
    sessionSecret.length < 16 ||
    sessionSecret === 'CHANGE_ME_STRONG_RANDOM_SESSION_SECRET'
  ) {
    missingKeys.push('ADMIN_SESSION_SECRET');
  }

  return {
    passphrase,
    sessionSecret,
    configured: missingKeys.length === 0,
    missingKeys,
  };
}

export function isAuthConfigured(): boolean {
  return getAuthConfig().configured;
}

export function timingSafeCompareStrings(candidate: string, expected: string, hmacKey?: string): boolean {
  if (!candidate || !expected) return false;
  const key = hmacKey || crypto.randomBytes(32);
  const digestA = crypto.createHmac('sha256', key).update(candidate, 'utf8').digest();
  const digestB = crypto.createHmac('sha256', key).update(expected, 'utf8').digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

export function verifyAdminPassphrase(candidate: string): boolean {
  const cfg = getAuthConfig();
  if (!cfg.configured) return false;
  if (typeof candidate !== 'string' || !candidate) return false;
  return timingSafeCompareStrings(candidate.trim(), cfg.passphrase, cfg.sessionSecret);
}

function toBase64Url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64url');
}

function fromBase64Url(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

function signEncodedPayload(encodedPayload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(encodedPayload, 'utf8').digest('base64url');
}

export function createSignedSessionToken(
  ttlMs: number = DEFAULT_SESSION_TTL_MS
): { token: string; payload: AdminSessionPayload } {
  const cfg = getAuthConfig();
  if (!cfg.configured) {
    throw new Error(
      `Admin authentication environment variables not configured: ${cfg.missingKeys.join(', ')}`
    );
  }

  const now = Date.now();
  const payload: AdminSessionPayload = {
    sub: 'admin',
    name: 'Vicky Vishwakarma',
    role: 'Founder & Lead Architect',
    iat: now,
    exp: now + ttlMs,
    jti: crypto.randomBytes(16).toString('hex'),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signEncodedPayload(encodedPayload, cfg.sessionSecret);
  return {
    token: `${encodedPayload}.${signature}`,
    payload,
  };
}

export function verifySignedSessionToken(
  token: string
): { valid: true; payload: AdminSessionPayload } | { valid: false; reason: string } {
  const cfg = getAuthConfig();
  if (!cfg.configured) {
    return { valid: false, reason: 'Server auth not configured' };
  }

  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Missing token' };
  }

  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, reason: 'Malformed session token' };
  }

  const [encodedPayload, providedSig] = parts;
  const expectedSig = signEncodedPayload(encodedPayload, cfg.sessionSecret);

  try {
    const providedBuf = fromBase64Url(providedSig);
    const expectedBuf = fromBase64Url(expectedSig);
    if (providedBuf.length === 0 || providedBuf.length !== expectedBuf.length) {
      return { valid: false, reason: 'Invalid signature' };
    }
    if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) {
      return { valid: false, reason: 'Signature mismatch' };
    }
  } catch {
    return { valid: false, reason: 'Signature decode error' };
  }

  let payload: AdminSessionPayload;
  try {
    payload = JSON.parse(fromBase64Url(encodedPayload).toString('utf8'));
  } catch {
    return { valid: false, reason: 'Corrupt payload' };
  }

  if (
    !payload ||
    payload.sub !== 'admin' ||
    typeof payload.iat !== 'number' ||
    typeof payload.exp !== 'number' ||
    typeof payload.jti !== 'string' ||
    payload.jti.length < 16
  ) {
    return { valid: false, reason: 'Invalid claims' };
  }

  const now = Date.now();
  if (now > payload.exp) {
    return { valid: false, reason: 'Session expired' };
  }
  if (payload.iat > now + 5000) {
    return { valid: false, reason: 'Session issued in future' };
  }

  pruneRevokedJtis();
  if (revokedJtis.has(payload.jti)) {
    return { valid: false, reason: 'Session revoked' };
  }

  return { valid: true, payload };
}

export function revokeSessionToken(token?: string): void {
  if (!token) return;
  const check = verifySignedSessionToken(token);
  if (check.valid) {
    revokedJtis.set(check.payload.jti, check.payload.exp);
    pruneRevokedJtis();
  }
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return cookies;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx <= 0) continue;
    const name = pair.slice(0, idx).trim();
    const rawVal = pair.slice(idx + 1).trim();
    try {
      cookies[name] = decodeURIComponent(rawVal);
    } catch {
      cookies[name] = rawVal;
    }
  }
  return cookies;
}

export function isSecureConnection(req: Request): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  if (req.secure) return true;
  const proto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  return proto.includes('https');
}

export function getSessionCookieOptions(req: Request, maxAgeMs?: number): CookieOptions {
  const opts: CookieOptions = {
    httpOnly: true,
    secure: isSecureConnection(req),
    sameSite: 'lax',
    path: '/',
  };
  if (typeof maxAgeMs === 'number') {
    opts.maxAge = maxAgeMs;
  }
  return opts;
}

export function getValidAdminSession(req: Request): AdminSessionPayload | null {
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[ADMIN_COOKIE_NAME];
  if (!cookieToken) return null;
  const result = verifySignedSessionToken(cookieToken);
  return result.valid ? result.payload : null;
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const cfg = getAuthConfig();
  if (!cfg.configured) {
    res.status(401).json({
      error:
        'Server authentication is not configured. Missing required environment variables: ' +
        cfg.missingKeys.join(', '),
    });
    return;
  }

  const session = getValidAdminSession(req);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized: Valid admin session required' });
    return;
  }
  next();
}
