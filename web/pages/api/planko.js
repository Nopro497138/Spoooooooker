// pages/api/planko.js
const cookie = require('cookie');
const { getDb } = require('../../lib/db');

function chooseColumnByRandom(numCols){
  // simple random plinko simulation: simulate binary steps across rows
  let pos = Math.floor(numCols/2);
  const rows = 11;
  for (let r=0;r<rows;r++){
    pos += (Math.random() < 0.5) ? -1 : 1;
    if (pos < 0) pos = 0;
    if (pos >= numCols) pos = numCols-1;
  }
  return pos;
}

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const discordId = cookies.discord_id;
  if (!discordId) return res.status(401).json({ error: 'Not authenticated. Please sign in.' });

  const { bet } = req.body || {};
  const betN = Number(bet);
  if (!betN || isNaN(betN) || betN <= 0) return res.status(400).json({ error: 'Invalid bet' });

  try {
    const db = await getDb();
    const user = await db.getUser(discordId);
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (betN > (user.candy || 0)) return res.status(400).json({ error: 'Insufficient candy' });

    // multipliers for columns (15 columns)
    const multipliers = [0, 0.5, 1, 1.1, 1.2, 1.4, 2, 3, 5, 2, 1.4, 1.2, 1.1, 1, 0.5];
    const cols = multipliers.length;

    const col = chooseColumnByRandom(cols);
    const mult = multipliers[col] || 0;
    const won = Math.floor(mult * betN);
    const change = won - betN;
    const newCandy = (user.candy || 0) - betN + Math.max(0, won);

    // update DB
    await db.updateCandy(discordId, newCandy);

    res.json({
      outcome: col === 0 ? 'Lose' : (mult > 1 ? 'Win' : 'Neutral'),
      column: col,
      multiplier: mult,
      change,
      newCandy
    });
  } catch (err) {
    console.error('planko api error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
