// pages/api/auth/login.js
const { getDb } = require('../../../lib/db.js');
const { verifyPassword, createSessionToken } = require('../../../lib/auth.js');
const cookie = require('cookie');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const db = await getDb();
    const user = await db.getUserByEmail(String(email).toLowerCase());
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // verify password
    if (!verifyPassword(password, user.passwordHash)) return res.status(400).json({ error: 'Invalid credentials' });

    // create session token
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
    console.error('auth/login error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
