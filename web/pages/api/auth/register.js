// pages/api/auth/register.js
import { getDb } from '../../../lib/db.js';
import { hashPassword, createSessionToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password, username } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const db = await getDb();
    // create password hash
    const pwHash = (await Promise.resolve()).then(()=>require('../../../lib/auth.js').hashPassword(password));
    // register
    const user = await db.registerUserWithEmail(String(email).toLowerCase(), pwHash, 50, username || null);

    // create JWT session
    const token = require('../../../lib/auth.js').createSessionToken({ sub: user.id, provider: 'email' });
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', require('cookie').serialize('session', token, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: 30 * 24 * 3600 }));
    res.json({ ok: true, user: { id: user.id, email: user.email, candy: user.candy } });
  } catch (err) {
    console.error('auth/register error', err);
    res.status(500).json({ error: String(err.message || 'Server error') });
  }
}
