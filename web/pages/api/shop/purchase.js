// pages/api/shop/purchase.js
const cookie = require('cookie');
const { getDb } = require('../../../lib/db.js');
const products = require('../../../data/products.js');
const coupons = require('../../../data/coupons.js');

function findCoupon(code) {
  if (!code) return null;
  const cleaned = String(code || '').trim().toUpperCase();
  if (!cleaned) return null;
  const c = (coupons || []).find(x => x.code && String(x.code).toUpperCase() === cleaned && x.active);
  if (!c) return null;
  if (c.expires && new Date(c.expires) < new Date()) return null;
  return c;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const discordId = cookies.discord_id;
    if (!discordId) return res.status(401).json({ error: 'Not authenticated' });

    const { productId, couponCode } = req.body || {};
    if (!productId) return res.status(400).json({ error: 'Missing productId' });

    const db = await getDb();
    const user = await db.getUser(discordId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const product = products.find(p => p.id === productId);
    if (!product) return res.status(400).json({ error: 'Product not found' });

    // compute price and apply coupon if present
    let price = Number(product.price || 0);
    let appliedCoupon = null;
    if (couponCode) {
      const cp = findCoupon(couponCode);
      if (!cp) return res.status(400).json({ error: 'Invalid coupon code' });
      appliedCoupon = { code: cp.code, type: cp.type, amount: cp.amount };
      if (cp.type === 'percent') {
        const discount = Math.floor((price * Number(cp.amount)) / 100);
        price = Math.max(0, price - discount);
      } else if (cp.type === 'fixed') {
        price = Math.max(0, price - Number(cp.amount));
      }
    }

    if ((user.candy || 0) < price) return res.status(400).json({ error: 'Insufficient candy' });

    // Deduct
    const newBalance = (user.candy || 0) - price;
    await db.updateCandy(discordId, newBalance);

    // create purchase
    const purchase = await db.addPurchase({
      discord_id: discordId,
      productId: product.id,
      productName: product.name,
      price
    });

    // Auto-confirm & apply auto_candy if configured and confirmation not required
    let applied = false;
    if (!product.require_confirmation) {
      await db.confirmPurchase(purchase.id);
      if (product.auto_candy) {
        await db.giveCandy(discordId, product.auto_candy, `auto-pack:${product.id}`);
        applied = true;
      } else {
        applied = true;
      }
    }

    // return stable, unambiguous response for the UI
    const updatedUser = await db.getUser(discordId);
    res.json({
      ok: true,
      purchase: {
        id: purchase.id,
        productId: purchase.productId,
        productName: purchase.productName,
        price: purchase.price,
        status: applied ? 'confirmed' : 'pending'
      },
      require_confirmation: !!product.require_confirmation,
      rewards_applied: applied,
      applied_coupon: appliedCoupon,
      user: { candy: updatedUser.candy }
    });
  } catch (err) {
    console.error('shop purchase error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
