// pages/api/dev/give_points.js
const { getDb } = require('../../../lib/db.js');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { discord_id, amount } = req.body || {};
  if (!discord_id || typeof amount === 'undefined') return res.status(400).json({ error: 'Missing fields' });

  try {
    const db = await getDb();
    await db.addUserIfNotExist(discord_id, 0);
    const u = await db.giveCandy(discord_id, Number(amount), 'admin-give');
    res.json({ ok: true, user: u });
  } catch (err) {
    console.error('dev/give_points error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
