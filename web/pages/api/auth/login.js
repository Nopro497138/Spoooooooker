// pages/api/auth/login.js
import { getDb } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const db = await getDb();
    const user = await db.getUserByEmail(email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // verify password
    const { verifyPassword, createSessionToken } = require('../../../lib/auth.js');
    if (!verifyPassword(password, user.passwordHash)) return res.status(400).json({ error: 'Invalid credentials' });

    // create session JWT
    const token = createSessionToken({ sub: user.id, provider: 'email' });
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', require('cookie').serialize('session', token, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: 30 * 24 * 3600 }));
    res.json({ ok: true, user: { id: user.id, email: user.email, candy: user.candy } });
  } catch (err) {
    console.error('auth/login error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
