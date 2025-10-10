// pages/api/dev/confirm_purchase.js
const { getDb } = require('../../../lib/db.js');
const products = require('../../../data/products.js');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const db = await getDb();
    const purchase = await db.confirmPurchase(id);

    // apply product-specific automatic candy if configured
    const product = products.find(p => p.id === purchase.productId);
    let applied = false;
    if (product && product.auto_candy) {
      await db.giveCandy(purchase.discord_id, product.auto_candy, `confirm:${product.id}`);
      applied = true;
    }
    res.json({ ok: true, purchase, rewards_applied: applied });
  } catch (err) {
    console.error('confirm_purchase error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
