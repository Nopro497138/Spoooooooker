// web/pages/api/auth/login.js
// Redirects user to Discord OAuth authorize URL.
// Uses NEXT_PUBLIC_SITE_URL (if set) to build redirect_uri to avoid "incorrect redirect_uri".

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

export default function handler(req, res) {
  if (!DISCORD_CLIENT_ID) {
    res.status(500).send('Missing DISCORD_CLIENT_ID');
    return;
  }

  // Prefer explicit site URL set in env (recommended)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || null;

  let base;
  if (siteUrl) {
    base = siteUrl.replace(/\/$/, ''); // trim trailing slash
  } else {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    base = `${proto}://${host}`;
  }

  const redirect = encodeURIComponent(`${base}/api/auth/callback`);
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify`;

  res.writeHead(302, { Location: url });
  res.end();
}
