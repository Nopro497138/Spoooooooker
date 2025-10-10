// pages/api/dev/purchases.js
const { getDb } = require('../../../lib/db');

export default async function handler(req,res){
  const db = await getDb();
  const purchases = await db.getPurchases({ status: 'pending' });
  res.json({ purchases });
}
