// pages/api/user.js
// Return current logged-in user's profile based on JWT session cookie
const cookie = require('cookie');
const { verifySessionToken } = require('../../lib/auth.js');
const { getDb } = require('../../lib/db.js');

export default async function handler(req, res) {
  try {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.session;
    if (!token) return res.json({});
    const payload = verifySessionToken(token);
    if (!payload || !payload.sub) return res.json({});
    const db = await getDb();
    const user = await db.getUserById(payload.sub);
    if (!user) return res.json({});
    const ownerId = process.env.OWNER_ID ? String(process.env.OWNER_ID) : null;
    res.json({
      id: user.id,
      discord_id: user.discord_id,
      email: user.email || null,
      candy: Number(user.candy || 0),
      messages: Number(user.messages || 0),
      username: user.username || null,
      discriminator: user.discriminator || null,
      is_owner: ownerId && user.discord_id && String(ownerId) === String(user.discord_id)
    });
  } catch (err) {
    console.error('api/user error', err);
    res.status(500).json({});
  }
}
