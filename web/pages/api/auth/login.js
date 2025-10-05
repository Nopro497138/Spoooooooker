// web/pages/api/auth/login.js
// Builds a Discord OAuth2 authorize URL and redirects the user to it.

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

export default function handler(req, res) {
  if (!DISCORD_CLIENT_ID) {
    res.status(500).send('Missing DISCORD_CLIENT_ID');
    return;
  }

  // Determine base URL from headers (works on Vercel)
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const base = `${proto}://${host}`;
  const redirect = encodeURIComponent(`${base}/api/auth/callback`);
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify`;

  res.writeHead(302, { Location: url });
  res.end();
}
