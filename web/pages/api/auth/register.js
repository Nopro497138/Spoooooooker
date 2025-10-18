// pages/api/auth/register.js
const { getDb } = require('../../../lib/db.js');
const { hashPassword, createSessionToken } = require('../../../lib/auth.js');
const cookie = require('cookie');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password, username } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const db = await getDb();

    // create password hash synchronously
    const pwHash = hashPassword(password);

    // register user (db will throw if email already in use)
    let user;
    try {
      user = await db.registerUserWithEmail(String(email).toLowerCase(), pwHash, 50, username || null);
    } catch (err) {
      // if email exists, return helpful message
      return res.status(400).json({ error: String(err.message || 'Email already in use') });
    }

    // create JWT session
    const token = createSessionToken({ sub: user.id, provider: 'email' });

    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', cookie.serialize('session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    }));

    return res.status(200).json({ ok: true, user: { id: user.id, email: user.email, candy: user.candy } });
  } catch (err) {
    console.error('auth/register error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
