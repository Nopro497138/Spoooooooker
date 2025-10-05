// web/pages/api/leaderboard.js
const { getDb } = require('../../lib/db');

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const rows = await db.getLeaderboard(20);
    const list = rows.map(r => ({
      discord_id: r.discord_id,
      points: r.points,
      username: r.username || ('User ' + r.discord_id),
      discriminator: r.discriminator || ''
    }));
    res.json({ leaderboard: list });
  } catch (err) {
    console.error('api/leaderboard error', err);
    res.status(500).json({ leaderboard: [] });
  }
}
