// web/pages/api/planko.js
// Plays Planko for the logged-in user. Validation + updates JSON DB.

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
    const r = await db.getUser(discordId);
    if (!r) return res.status(400).json({ error: 'User not found.' });
    let points = Number(r.points || 0);

    if (bet > points) return res.status(400).json({ error: 'Insufficient points.' });

    // roll logic for Planko (ball falls into multipliers)
    const roll = Math.random(); // 0..1
    // map to multipliers distribution
    // 0..0.7 -> lose (0)
    // 0.7..0.9 -> 1.5x
    // 0.9..0.97 -> 2x
    // 0.97..1 -> 5x
    let multiplier = 0;
    let outcome = 'Lose';
    if (roll < 0.7) { multiplier = 0; outcome = 'Lose'; }
    else if (roll < 0.9) { multiplier = 1.5; outcome = 'Small win'; }
    else if (roll < 0.97) { multiplier = 2; outcome = 'Nice win'; }
    else { multiplier = 5; outcome = 'Jackpot!'; }

    const won = Math.floor(multiplier * bet);
    const change = won - bet;
    const newPoints = points - bet + Math.max(0, won);

    await db.updatePoints(discordId, newPoints);

    // include chosen "slot" index for frontend animation (0..3 representing multiplier buckets)
    let bucket = 0;
    if (multiplier === 0) bucket = 0;
    else if (multiplier === 1.5) bucket = 1;
    else if (multiplier === 2) bucket = 2;
    else bucket = 3;

    res.json({ outcome, multiplier, change, newPoints, bucket });
  } catch (err) {
    console.error('api/planko error', err);
    res.status(500).json({ error: 'Server error.' });
  }
}
