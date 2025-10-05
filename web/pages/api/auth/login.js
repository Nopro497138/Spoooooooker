// web/pages/api/auth/login.js
// Builds a Discord OAuth2 authorize URL dynamically using forwarded headers
export default function handler(req, res) {
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  if (!DISCORD_CLIENT_ID) {
    res.status(500).send('Missing DISCORD_CLIENT_ID');
    return;
  }

  // Build base URL from forwarded headers (works on Vercel)
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const base = `${proto}://${host}`;
  // build redirect to our callback route
  const redirect = encodeURIComponent(`${base}/api/auth/callback`);
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify`;

  // redirect user
  res.writeHead(302, { Location: url });
  res.end();
}
