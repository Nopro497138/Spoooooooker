// pages/api/auth/callback.js
// OAuth callback: exchanges code, fetches user, sets cookie and upserts user in memory DB.
// Makes sure it won't overwrite an existing user's candy if already present.

const cookie = require('cookie');
const { getDb } = require('../../../lib/db.js');

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code.');

  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) return res.status(500).send('Missing Discord config.');

  try {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const redirect_uri = `${proto}://${host}/api/auth/callback`;

    const params = new URLSearchParams();
    params.append('client_id', DISCORD_CLIENT_ID);
    params.append('client_secret', DISCORD_CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirect_uri);
    params.append('scope', 'identify');

    const tokenResp = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: params.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }
    });
    const tokenData = await tokenResp.json();
    if (!tokenResp.ok || !tokenData.access_token) {
      console.error('OAuth token error', tokenData);
      return res.status(502).send('OAuth token exchange failed. Check Redirect URI in Discord app.');
    }

    const userResp = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Accept': 'application/json' }
    });
    const userData = await userResp.json();
    if (!userResp.ok || !userData || !userData.id) {
      console.error('OAuth user fetch error', userData);
      return res.status(502).send('Failed to fetch user from Discord.');
    }

    const db = await getDb();
    // if user exists in our in-memory DB, do not overwrite candy
    const existing = await db.getUser(userData.id);
    if (!existing) {
      await db.addUserIfNotExist(userData.id, 50); // fresh user gets starter 50
    }
    await db.upsertMeta(userData.id, userData.username, userData.discriminator);

    // set cookie
    const isProd = process.env.NODE_ENV === 'production';
    const cookieStr = cookie.serialize('discord_id', String(userData.id), {
      httpOnly: true,
      secure: isProd,
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax'
    });
    res.setHeader('Set-Cookie', cookieStr);
    res.writeHead(302, { Location: '/' });
    res.end();
  } catch (err) {
    console.error('OAuth callback error', err);
    res.status(500).send('Server error during OAUTH.');
  }
}
