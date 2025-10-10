// pages/api/shop/purchase.js
const cookie = require('cookie');
const { getDb } = require('../../lib/db');
const products = require('../../data/products');

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });

  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const discordId = cookies.discord_id;
  if (!discordId) return res.status(401).json({ error: 'Not authenticated' });

  const { productId } = req.body || {};
  if (!productId) return res.status(400).json({ error: 'Missing productId' });

  try {
    const db = await getDb();
    const user = await db.getUser(discordId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const product = products.find(p => p.id === productId);
    if (!product) return res.status(400).json({ error: 'Product not found' });

    if ((user.candy || 0) < product.price) return res.status(400).json({ error: 'Insufficient candy' });

    await db.updateCandy(discordId, (user.candy || 0) - product.price);
    const purchase = await db.addPurchase({ discord_id: discordId, productId: product.id, productName: product.name, price: product.price });

    res.json({ ok:true, purchase });
  } catch (err) {
    console.error('shop purchase error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
