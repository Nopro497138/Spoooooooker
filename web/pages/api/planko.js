// web/pages/api/planko.js
// Plays Planko for the logged-in user. Performs validation and updates the DB.

const cookie = require('cookie');
const { getDb } = require('../../lib/db');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const discordId = cookies.discord_id;
  if (!discordId) return res.status(401).json({ error: 'Not authenticated. Please sign in with Discord.' });

  const betRaw = req.body?.bet ?? req.query?.bet;
  const bet = Number(betRaw);
  if (!bet || isNaN(bet) || bet <= 0) return res.status(400).json({ error: 'Invalid bet amount.' });

  try {
    const db = await getDb();

    // "FOR UPDATE" not available — emulate by reading + updating synchronously
    const r = await db.get('SELECT points FROM users WHERE discord_id = ?', [discordId]);
    if (!r) return res.status(400).json({ error: 'User not found.' });
    let points = Number(r.points);

    if (bet > points) return res.status(400).json({ error: 'Insufficient points.' });

    // roll logic
    const roll = Math.floor(Math.random() * 1000); // 0..999
    let multiplier = 0;
    let outcome = 'Lose';
    if (roll < 700) { multiplier = 0; outcome = 'Lose'; }
    else if (roll < 900) { multiplier = 1.5; outcome = 'Small win'; }
    else if (roll < 970) { multiplier = 2; outcome = 'Nice win'; }
    else { multiplier = 5; outcome = 'Jackpot!'; }

    const won = Math.floor(multiplier * bet);
    const change = won - bet;
    const newPoints = points - bet + Math.max(0, won);

    await db.run('UPDATE users SET points = ? WHERE discord_id = ?', [newPoints, discordId]);

    res.json({ outcome, multiplier, change, newPoints });
  } catch (err) {
    console.error('api/planko error', err);
    res.status(500).json({ error: 'Server error.' });
  }
}
