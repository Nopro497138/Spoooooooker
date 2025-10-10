// pages/api/user.js
const cookie = require('cookie');
const { getDb } = require('../../lib/db.js');

export default async function handler(req, res){
  try {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const discordId = cookies.discord_id;
    if (!discordId) {
      return res.json({});
    }
    const db = await getDb();
    const user = await db.getUser(discordId);
    if (!user) return res.json({});
    const ownerId = process.env.OWNER_ID ? String(process.env.OWNER_ID) : null;
    res.json({
      discord_id: user.discord_id,
      candy: user.candy || 0,
      messages: user.messages || 0,
      username: user.username || null,
      discriminator: user.discriminator || null,
      is_owner: ownerId && String(ownerId) === String(user.discord_id)
    });
  } catch (err) {
    console.error('api/user error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
