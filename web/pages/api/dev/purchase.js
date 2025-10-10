// pages/api/dev/purchases.js
const { getDb } = require('../../../lib/db.js');

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const purchases = await db.getPurchases({ status: 'pending' });
    res.json({ purchases });
  } catch (err) {
    console.error('dev/purchases error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
