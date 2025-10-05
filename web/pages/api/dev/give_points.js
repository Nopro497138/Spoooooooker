// web/pages/api/dev/give_points.js
const { getDb } = require('../../lib/db')
const cookie = require('cookie')

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
  const discordId = cookies.discord_id
  const OWNER_ID = process.env.OWNER_ID || process.env.BOT_OWNER_ID || null
  if (!discordId || String(discordId) !== String(OWNER_ID)) { res.status(403).json({ error: 'Forbidden' }); return }

  const { discordId: target, amount } = req.body || {}
  if (!target || !amount) return res.status(400).json({ error: 'Missing fields' })
  try {
    const db = await getDb()
    const updated = await db.givePoints(target, Number(amount), `dev_grant_by_${discordId}`)
    res.json({ ok: true, updated })
  } catch (err) {
    console.error('dev give_points', err)
    res.status(500).json({ error: 'Server error' })
  }
}
