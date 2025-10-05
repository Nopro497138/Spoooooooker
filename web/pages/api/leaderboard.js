// web/pages/api/leaderboard.js
// Returns a simple top-10 leaderboard (points + username if available).

const { getDb } = require('../../lib/db');

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const rows = await db.all(`
      SELECT u.discord_id, u.points, m.username, m.discriminator
      FROM users u
      LEFT JOIN users_meta m ON u.discord_id = m.discord_id
      ORDER BY u.points DESC, u.messages DESC
      LIMIT 10
    `);
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
