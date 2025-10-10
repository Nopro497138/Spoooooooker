// pages/api/shop/purchase.js
const cookie = require('cookie');
const { getDb } = require('/lib/db.js');
const products = require('/data/products.js');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const discordId = cookies.discord_id;
    if (!discordId) return res.status(401).json({ error: 'Not authenticated' });

    const { productId } = req.body || {};
    if (!productId) return res.status(400).json({ error: 'Missing productId' });

    const db = await getDb();
    const user = await db.getUser(discordId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const product = products.find(p => p.id === productId);
    if (!product) return res.status(400).json({ error: 'Product not found' });

    if ((user.candy || 0) < product.price) return res.status(400).json({ error: 'Insufficient candy' });

    // Deduct candy
    await db.updateCandy(discordId, (user.candy || 0) - product.price);

    // create purchase
    const purchase = await db.addPurchase({
      discord_id: discordId,
      productId: product.id,
      productName: product.name,
      price: product.price
    });

    // Auto-confirm if not required
    if (!product.require_confirmation) {
      await db.confirmPurchase(purchase.id);
      // apply immediate rewards if any
      if (product.rewards && product.rewards.candy) {
        // give the reward candy
        await db.giveCandy(discordId, product.rewards.candy, `auto-pack:${product.id}`);
      }
    }

    res.json({ ok: true, purchase });
  } catch (err) {
    console.error('shop purchase error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
