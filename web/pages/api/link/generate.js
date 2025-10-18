// pages/api/link/generate.js
// Generate a short link token for a logged-in website user.
// They then give this token to the Discord bot via /link <TOKEN> (bot will call /api/link/complete).

import cookie from 'cookie';
import { verifySessionToken } from '../../../lib/auth.js';
import { getDb } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.session;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const payload = verifySessionToken(token);
    if (!payload || !payload.sub) return res.status(401).json({ error: 'Invalid session' });
    const db = await getDb();
    const user = await db.getUserById(payload.sub);
    if (!user) return res.status(400).json({ error: 'User not found' });
    const linkToken = await db.generateLinkTokenForUser(user.id, 60 * 15); // 15 min
    res.json({ ok: true, token: linkToken, expires_in: 15 * 60 });
  } catch (err) {
    console.error('link/generate error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
