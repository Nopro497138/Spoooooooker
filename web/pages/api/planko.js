// pages/api/planko.js
const cookie = require('cookie');
const { getDb } = require('../../lib/db.js');

// Weighted columns distribution (more losing columns than high multipliers)
const columns = [
  { mult: 0, weight: 60 },
  { mult: 0.5, weight: 40 },
  { mult: 1, weight: 80 },
  { mult: 1.1, weight: 70 },
  { mult: 1.2, weight: 50 },
  { mult: 1.4, weight: 30 },
  { mult: 2, weight: 15 },
  { mult: 3, weight: 6 },
  { mult: 5, weight: 2 },
  { mult: 2, weight: 15 },
  { mult: 1.4, weight: 30 },
  { mult: 1.2, weight: 50 },
  { mult: 1.1, weight: 70 },
  { mult: 1, weight: 80 },
  { mult: 0.5, weight: 40 }
];

function weightedPickIndex() {
  const arr = [];
  for (let i = 0; i < columns.length; i++) {
    const w = columns[i].weight || 1;
    for (let j = 0; j < w; j++) arr.push(i);
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const discordId = cookies.discord_id;
  if (!discordId) return res.status(401).json({ error: 'Not authenticated' });

  const { bet } = req.body || {};
  const betN = Number(bet);
  if (!betN || isNaN(betN) || betN <= 0) return res.status(400).json({ error: 'Invalid bet' });

  try {
    const db = await getDb();
    const user = await db.getUser(discordId);
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (betN > (user.candy || 0)) return res.status(400).json({ error: 'Insufficient candy' });

    // pick column by weights
    const colIdx = weightedPickIndex();
    const mult = columns[colIdx].mult || 0;
    const won = Math.floor(mult * betN);
    const change = won - betN;
    const newCandy = (user.candy || 0) - betN + Math.max(0, won);

    // update DB
    await db.updateCandy(discordId, newCandy);

    res.json({
      outcome: mult === 0 ? 'Lose' : (mult > 1 ? 'Win' : 'Neutral'),
      column: colIdx,
      multiplier: mult,
      change,
      newPoints: newCandy,
      newCandy
    });
  } catch (err) {
    console.error('planko api error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
