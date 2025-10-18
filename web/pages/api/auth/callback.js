// pages/api/auth/callback.js
// Discord OAuth callback: exchange code, fetch user, upsert into db and create session JWT
const cookie = require('cookie');
const { getDb } = require('../../../lib/db.js');
const { createSessionToken } = require('../../../lib/auth.js');

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

    // use global fetch available in Next.js runtime
    const tokenResp = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: params.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    if (!tokenResp.ok) {
      const txt = await tokenResp.text();
      console.error('discord token failed', txt);
      return res.status(502).send('OAuth token exchange failed.');
    }
    const tokenData = await tokenResp.json();
    if (!tokenData.access_token) {
      console.error('discord token missing', tokenData);
      return res.status(502).send('OAuth token exchange failed.');
    }

    const userResp = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    if (!userResp.ok) {
      const t = await userResp.text();
      console.error('discord user fetch failed', t);
      return res.status(502).send('OAuth user fetch failed.');
    }
    const userData = await userResp.json();
    if (!userData || !userData.id) return res.status(502).send('Invalid user data');

    const db = await getDb();
    // if a user with this discord exists, use it; else create one and give starter candy
    const ex = await db.getUserByDiscord(userData.id);
    if (ex) {
      // update meta
      await db.upsertMetaByDiscord(userData.id, userData.username, userData.discriminator);
      // create session token using internal user id
      const token = createSessionToken({ sub: ex.id, provider: 'discord' });
      const isProd = process.env.NODE_ENV === 'production';
      res.setHeader('Set-Cookie', cookie.serialize('session', token, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: 30 * 24 * 3600 }));
      res.writeHead(302, { Location: '/' });
      res.end();
      return;
    } else {
      // create a new user linked to discord with starter candy 50
      const created = await db.addUserIfNotExist(userData.id, 50);
      await db.upsertMetaByDiscord(userData.id, userData.username, userData.discriminator);
      const token = createSessionToken({ sub: created.id, provider: 'discord' });
      const isProd = process.env.NODE_ENV === 'production';
      res.setHeader('Set-Cookie', cookie.serialize('session', token, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: 30 * 24 * 3600 }));
      res.writeHead(302, { Location: '/' });
      res.end();
      return;
    }
  } catch (err) {
    console.error('OAuth callback error', err);
    res.status(500).send('Server error during OAUTH.');
  }
}
