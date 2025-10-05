// web/pages/api/user.js
// Return small user payload based on session cookie

const cookie = require('cookie');
const { getDb } = require('../../lib/db');

export default async function handler(req, res) {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const discordId = cookies.discord_id;
  if (!discordId) return res.json({});

  try {
    const db = await getDb();
    const row = await db.getUser(discordId);
    if (!row) return res.json({});
    res.json({
      discord_id: row.discord_id,
      points: row.points,
      messages: row.messages,
      username: row.username || null,
      discriminator: row.discriminator || null
    });
  } catch (err) {
    console.error('api/user error', err);
    res.status(500).json({});
  }
}
