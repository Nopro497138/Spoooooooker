// pages/api/slot.js
const cookie = require('cookie');
const { getDb } = require('../../lib/db.js');

const symbols = [
  { id: 'cherry', mult: 0.5 },
  { id: 'lemon', mult: 0.75 },
  { id: 'pumpkin', mult: 1 },
  { id: 'ghost', mult: 1.4 },
  { id: 'skull', mult: 2 },
  { id: 'star', mult: 3 }
];

function spinReel() {
  // simple weighted list
  const arr = [];
  symbols.forEach((s, i) => {
    const weight = i === 2 ? 8 : i === 3 ? 5 : i === 4 ? 3 : 4;
    for (let j = 0; j < weight; j++) arr.push(s);
  });
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

    // spin
    const r1 = spinReel();
    const r2 = spinReel();
    const r3 = spinReel();

    let multiplier = 0;
    if (r1.id === r2.id && r2.id === r3.id) multiplier = r1.mult * 3;
    else if (r1.id === r2.id || r2.id === r3.id || r1.id === r3.id) multiplier = 1.2;
    else multiplier = 0;

    const won = Math.floor(multiplier * betN);
    const newCandy = (user.candy || 0) - betN + Math.max(0, won);

    await db.updateCandy(discordId, newCandy);

    res.json({
      reels: [r1.id, r2.id, r3.id],
      multiplier, won, newCandy
    });
  } catch (err) {
    console.error('slot api error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
