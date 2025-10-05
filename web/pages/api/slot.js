// web/pages/api/slot.js
// Simulates a slot machine spin and updates user's points.

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

    // Slot logic: three reels, symbols mapped to payout multipliers.
    // We'll simulate a basic slot: symbols array with weighted probabilities.

    const symbols = [
      { name: '🍒', weight: 40, mult: 0.5 },
      { name: '🔔', weight: 30, mult: 1 },
      { name: '⭐', weight: 20, mult: 2 },
      { name: '💀', weight: 8, mult: 5 },
      { name: '🎃', weight: 2, mult: 10 }
    ];

    // build cumulative for random draw
    const totalWeight = symbols.reduce((s, x) => s + x.weight, 0);
    function pickSymbol() {
      let r = Math.random() * totalWeight;
      for (const s of symbols) {
        r -= s.weight;
        if (r <= 0) return s;
      }
      return symbols[0];
    }

    const reel1 = pickSymbol();
    const reel2 = pickSymbol();
    const reel3 = pickSymbol();

    // determine outcome: if all three same -> payout mult = symbol.mult * 3
    // if two same -> smaller payout; else small loss
    let multiplier = 0;
    let outcome = 'Lose';
    if (reel1.name === reel2.name && reel2.name === reel3.name) {
      multiplier = reel1.mult * 3;
      outcome = 'Big Win';
    } else if (reel1.name === reel2.name || reel1.name === reel3.name || reel2.name === reel3.name) {
      // find matched symbol mult
      const matched = reel1.name === reel2.name ? reel1 : (reel1.name === reel3.name ? reel1 : reel2);
      multiplier = matched.mult * 1.5;
      outcome = 'Small Win';
    } else {
      multiplier = 0;
      outcome = 'Lose';
    }

    const won = Math.floor(multiplier * bet);
    const change = won - bet;
    const newPoints = points - bet + Math.max(0, won);

    await db.updatePoints(discordId, newPoints);

    res.json({
      outcome,
      multiplier,
      change,
      newPoints,
      reels: [reel1.name, reel2.name, reel3.name]
    });
  } catch (err) {
    console.error('api/slot error', err);
    res.status(500).json({ error: 'Server error.' });
  }
}
