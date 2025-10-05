// web/pages/api/dev/purchases.js
const { getDb } = require('../../lib/db.js')
const cookie = require('cookie')

export default async function handler(req, res) {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
  const discordId = cookies.discord_id
  const OWNER_ID = process.env.OWNER_ID || process.env.BOT_OWNER_ID || null
  if (!discordId || String(discordId) !== String(OWNER_ID)) { res.status(403).json({ error: 'Forbidden' }); return }
  try {
    const db = await getDb()
    const purchases = await db.getPurchases({ status: 'pending' })
    res.json({ purchases })
  } catch (err) {
    console.error('dev purchases', err)
    res.status(500).json({ error: 'Server error' })
  }
}
