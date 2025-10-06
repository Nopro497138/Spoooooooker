// web/pages/api/shop/purchase.js
import { getDb } from '../../../lib/db'
import cookie from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Method not allowed' }) }

  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
  const discordId = cookies.discord_id
  if (!discordId) return res.status(401).json({ error: 'Not authenticated' })

  const { productId } = req.body || {}
  if (!productId) return res.status(400).json({ error: 'Missing productId' })

  const db = await getDb()
  const user = await db.getUser(discordId)
  if (!user || user.candy < 50) return res.status(400).json({ error: 'Not enough Halloween Candy' })

  const product = require('../../../data/products.js').find(p => p.id === productId)
  if (!product) return res.status(400).json({ error: 'Product not found' })

  await db.updateCandy(discordId, user.candy - product.price)
  await db.addPurchase({ discord_id: discordId, productId: product.id, productName: product.name, price: product.price })
  res.status(200).json({ success: true, message: `You have purchased ${product.name} for ${product.price} Halloween Candy` })
}
