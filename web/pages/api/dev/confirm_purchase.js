// web/pages/api/dev/confirm_purchase.js
const { getDb } = require('../../../lib/db')
const cookie = require('cookie')

export default async function handler(req, res) {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
  const discordId = cookies.discord_id
  const OWNER_ID = process.env.OWNER_ID || process.env.BOT_OWNER_ID || null
  if (!discordId || String(discordId) !== String(OWNER_ID)) { res.status(403).json({ error: 'Forbidden' }); return }

  const { id } = req.body || {}
  if (!id) return res.status(400).json({ error: 'Missing id' })
  try {
    const db = await getDb()
    const purchase = await db.confirmPurchase(id)
    res.json({ ok: true, purchase })
  } catch (err) {
    console.error('confirm purchase', err)
    res.status(500).json({ error: 'Server error' })
  }
}
