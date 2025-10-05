// web/pages/api/dev/is_owner.js
const cookie = require('cookie')
const { getDb } = require('../../../lib/db')

export default async function handler(req, res) {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
  const discordId = cookies.discord_id
  const OWNER_ID = process.env.OWNER_ID || process.env.BOT_OWNER_ID || null
  if (!discordId || !OWNER_ID) return res.json({ isOwner: false })
  // simple compare
  res.json({ isOwner: String(discordId) === String(OWNER_ID) })
}
