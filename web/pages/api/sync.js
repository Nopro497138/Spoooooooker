// pages/api/sync.js
const { getDb } = require('../../lib/db');

export default async function handler(req, res){
  // Only POST allowed
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const tokenHeader = req.headers['x-sync-token'] || req.query.token;
  const expected = process.env.WEBSITE_SYNC_TOKEN;
  if (!expected || !tokenHeader || String(tokenHeader) !== String(expected)) {
    return res.status(403).json({ error: 'Invalid sync token' });
  }

  const body = req.body || {};
  const { discord_id, candy } = body;
  if (!discord_id || typeof candy === 'undefined') return res.status(400).json({ error: 'Missing fields' });

  try {
    const db = await getDb();
    // ensure user exists; then update candy
    await db.addUserIfNotExist(discord_id, Number(candy));
    await db.updateCandy(discord_id, Number(candy));
    const user = await db.getUser(discord_id);
    res.json({ ok: true, user });
  } catch (err) {
    console.error('sync error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
