// pages/api/auth/discord.js
// Initiate Discord OAuth redirect
export default async function handler(req, res) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) return res.status(500).send('Discord not configured');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const redirectUri = encodeURIComponent(`${proto}://${host}/api/auth/callback`);
  const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;
  res.redirect(url);
}
