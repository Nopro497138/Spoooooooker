// web/pages/api/shop/purchase.js
const cookie = require('cookie')
const { getDb } = require('../../lib/db.js')
const PRODUCTS = require('../../data/products.js')

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
  const discordId = cookies.discord_id
  if (!discordId) return res.status(401).json({ error: 'Not authenticated' })

  const { productId } = req.body || {}
  if (!productId) return res.status(400).json({ error: 'Missing productId' })

  const product = PRODUCTS.find(p => p.id === productId)
  if (!product) return res.status(400).json({ error: 'Product not found' })

  try {
    const db = await getDb()
    const user = await db.getUser(discordId)
    if (!user) return res.status(400).json({ error: 'User not found' })
    if (user.points < product.price) return res.status(400).json({ error: 'Insufficient points' })

    // deduct immediately (reserve)
    await db.updatePoints(discordId, user.points - product.price)
    // add purchase record (pending)
    const purchase = await db.addPurchase({
      discord_id: discordId,
      productId: product.id,
      productName: product.name,
      price: product.price
    })
    res.json({ ok: true, purchase })
  } catch (err) {
    console.error('shop purchase error', err)
    res.status(500).json({ error: 'Server error' })
  }
}
