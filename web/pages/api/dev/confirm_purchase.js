// pages/api/dev/confirm_purchase.js
const { getDb } = require('../../../lib/db');
const products = require('../../../data/products');

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const db = await getDb();
  try {
    const p = await db.confirmPurchase(id);
    // find product and apply rewards if applicable
    const product = products.find(pp => pp.id === p.productId);
    if (product && product.rewards && product.rewards.candy) {
      await db.giveCandy(p.discord_id, product.rewards.candy, `pack-confirm:${product.id}`);
    }
    res.json({ ok:true, purchase: p });
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' });
  }
}
