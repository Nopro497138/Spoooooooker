// pages/api/link/complete.js
// Called by the Discord bot (server-side) when user executes /link <TOKEN> in Discord.
// This endpoint expects a header X-WEBSITE-SYNC-TOKEN that matches WEBSITE_SYNC_TOKEN env var for authentication.

const { getDb } = require('../../../lib/db.js');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const auth = req.headers['x-website-sync-token'] || req.headers['x-sync-token'] || req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'Missing sync token' });
    const expected = process.env.WEBSITE_SYNC_TOKEN || null;
    if (!expected || String(auth) !== String(expected)) return res.status(403).json({ error: 'Invalid sync token' });

    const { token, discord_id } = req.body || {};
    if (!token || !discord_id) return res.status(400).json({ error: 'Missing fields' });

    const db = await getDb();
    const userId = await db.consumeLinkToken(token);
    if (!userId) return res.status(400).json({ error: 'Invalid or expired token' });

    // link the discord id to the user
    const user = await db.linkDiscordToUser(userId, discord_id);

    res.json({ ok: true, user: { id: user.id, discord_id: user.discord_id, candy: user.candy } });
  } catch (err) {
    console.error('link/complete error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
