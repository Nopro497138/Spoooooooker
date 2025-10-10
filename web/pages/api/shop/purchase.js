// pages/api/shop/purchase.js
const cookie = require('cookie');
const { getDb } = require('../../../lib/db.js');
const products = require('../../../data/products.js');

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

    // Deduct candy (atomic-ish in-memory)
    const newBalance = (user.candy || 0) - product.price;
    await db.updateCandy(discordId, newBalance);

    // create purchase record
    const purchase = await db.addPurchase({
      discord_id: discordId,
      productId: product.id,
      productName: product.name,
      price: product.price
    });

    // If product does NOT require confirmation and has auto_candy, apply immediately
    let applied = false;
    if (!product.require_confirmation) {
      await db.confirmPurchase(purchase.id);
      if (product.auto_candy) {
        await db.giveCandy(discordId, product.auto_candy, `auto-pack:${product.id}`);
        applied = true;
      } else {
        // if no auto_candy but no confirmation required, mark confirmed
        applied = true;
      }
    }

    // Return clear payload: whether owner confirmation required, whether rewards applied and the user's current candy
    const updatedUser = await db.getUser(discordId);
    res.json({
      ok: true,
      purchase: { id: purchase.id, productId: purchase.productId, productName: purchase.productName, price: purchase.price, status: applied ? 'confirmed' : 'pending' },
      require_confirmation: !!product.require_confirmation,
      rewards_applied: applied,
      user: { candy: updatedUser.candy }
    });
  } catch (err) {
    console.error('shop purchase error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
