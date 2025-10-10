// pages/api/leaderboard.js
const { getDb } = require('lib/db.js');

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const top = await db.getLeaderboard(20);
    res.json({ leaderboard: top });
  } catch (err) {
    console.error('leaderboard error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
