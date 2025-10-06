// web/pages/api/auth/callback.js
import { openDb } from '../../../lib/db'
import cookie from 'cookie'

export default async function handler(req, res) {
  const code = req.query.code
  if (!code) return res.status(400).send('Missing code.')
  
  const db = openDb()
  
  // After OAuth, insert user into the database
  const params = new URLSearchParams()
  params.append('client_id', process.env.DISCORD_CLIENT_ID)
  params.append('client_secret', process.env.DISCORD_CLIENT_SECRET)
  params.append('code', code)
  params.append('grant_type', 'authorization_code')
  params.append('redirect_uri', 'https://your-site.com/api/auth/callback')

  // Handle OAuth token exchange
  const tokenResp = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  const tokenData = await tokenResp.json()

  if (!tokenData.access_token) {
    return res.status(500).send('Failed to get access token')
  }

  // Fetch user data from Discord
  const userResp = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  })
  const userData = await userResp.json()
  
  if (!userData) {
    return res.status(500).send('Failed to fetch user data')
  }

  const { id, username, discriminator } = userData
  db.run(`INSERT OR REPLACE INTO users (discord_id, username, discriminator) VALUES (?, ?, ?)`, [id, username, discriminator])

  res.status(302).setHeader('Location', '/')
  res.end()
}
