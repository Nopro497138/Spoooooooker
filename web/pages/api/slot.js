// web/pages/api/slot.js
// Server-side slot logic: validates bet, computes reels & multiplier, updates points in JSON DB.

const { getDb } = require('../../lib/db')
const cookie = require('cookie')

// simple symbol set and multiplier rules
const SYMBOLS = ['🍒','🎃','⭐','👻','💀']
const WEIGHTS = [40, 20, 15, 15, 10] // same as client
function pickSymbol() {
  const total = WEIGHTS.reduce((a,b)=>a+b,0)
  let r = Math.floor(Math.random() * total)
  for (let i=0;i<WEIGHTS.length;i++){
    r -= WEIGHTS[i]
    if (r < 0) return SYMBOLS[i]
  }
  return SYMBOLS[0]
}

function computeMultiplier(reels) {
  // if three same -> big reward based on symbol
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    const s = reels[0]
    if (s === '🍒') return 2
    if (s === '🎃') return 4
    if (s === '⭐') return 6
    if (s === '👻') return 8
    if (s === '💀') return 12 // rare jackpot
  }
  // two of same = small win
  if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) return 1.5
  return 0
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' }); return
  }

  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
  const discordId = cookies.discord_id
  if (!discordId) return res.status(401).json({ error: 'Not authenticated' })

  const betRaw = req.body?.bet
  const bet = Number(betRaw)
  if (!bet || isNaN(bet) || bet <= 0) return res.status(400).json({ error: 'Invalid bet' })

  try {
    const db = await getDb()
    const user = await db.getUser(discordId)
    if (!user) return res.status(400).json({ error: 'User not found' })
    if (bet > user.points) return res.status(400).json({ error: 'Insufficient points' })

    // pick reels
    const reels = [pickSymbol(), pickSymbol(), pickSymbol()]
    const multiplier = computeMultiplier(reels)
    const won = Math.floor(multiplier * bet)
    const change = won - bet
    const newPoints = user.points - bet + Math.max(0, won)

    await db.updatePoints(discordId, newPoints)

    let outcome = 'Lose'
    if (multiplier === 0) outcome = 'Lose'
    else if (multiplier === 1.5) outcome = 'Small win'
    else if (multiplier > 1 && multiplier <=4) outcome = 'Nice win'
    else outcome = 'Jackpot!'

    res.json({ reels, multiplier, won, change, newPoints, outcome })
  } catch (err) {
    console.error('api/slot error', err)
    res.status(500).json({ error: 'Server error' })
  }
}
