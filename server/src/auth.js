/**
 * @file auth.js
 * @description Authentication routes and middleware utilizing Google OAuth2 and secure session cookies.
 */
import crypto from 'node:crypto';
import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { query } from './db.js';

const COOKIE = 'qn_session';
const STATE_COOKIE = 'qn_oauth_state';
const SESSION_DAYS = 14;
const isProd = process.env.NODE_ENV === 'production';

const appUrl = () => process.env.APP_URL;
const oauth = () =>
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${appUrl()}/api/auth/google/callback`,
  );

const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');
const cookieOpts = { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' };

async function loadUser(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  const { rows } = await query(
    `SELECT u.id, u.email, u.name, u.picture, u.created_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hash(token)],
  );
  return rows[0] ?? null;
}

/**
 * Middleware to ensure the request is authenticated with a valid session.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
export async function requireAuth(req, res, next) {
  try {
    const user = await loadUser(req);
    if (!user) return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

const router = Router();

router.get('/google', (req, res) => {
  const state = crypto.randomBytes(24).toString('hex');
  res.cookie(STATE_COOKIE, state, { ...cookieOpts, maxAge: 10 * 60 * 1000 });
  res.redirect(
    oauth().generateAuthUrl({ scope: ['openid', 'email', 'profile'], state, prompt: 'select_account' }),
  );
});

router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const expected = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, cookieOpts);
  try {
    if (typeof code !== 'string' || !expected || state !== expected) throw new Error('bad state');
    const client = oauth();
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload();
    if (!p?.sub || !p.email || !p.email_verified) throw new Error('unverified account');

    const { rows } = await query(
      `INSERT INTO users (google_sub, email, name, picture) VALUES ($1,$2,$3,$4)
       ON CONFLICT (google_sub) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, picture = EXCLUDED.picture
       RETURNING id`,
      [p.sub, p.email, p.name ?? null, p.picture ?? null],
    );
    const token = crypto.randomBytes(32).toString('hex');
    await query(`DELETE FROM sessions WHERE expires_at < now()`);
    await query(
      `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1,$2, now() + ($3 || ' days')::interval)`,
      [hash(token), rows[0].id, String(SESSION_DAYS)],
    );
    res.cookie(COOKIE, token, { ...cookieOpts, maxAge: SESSION_DAYS * 86_400_000 });
    res.redirect('/app');
  } catch (err) {
    console.error('OAuth callback failed:', err.message);
    res.redirect('/login?error=auth');
  }
});

// Returns { user: null } instead of 401 so the client can boot without console errors.
router.get('/me', async (req, res, next) => {
  try {
    res.json({ user: await loadUser(req) });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE];
    if (token) await query(`DELETE FROM sessions WHERE token_hash = $1`, [hash(token)]);
    res.clearCookie(COOKIE, cookieOpts);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
