// web/pages/api/auth/callback.js
// Exchanges the OAuth code for a token, fetches the Discord user,
// upserts them into the local DB and sets a secure HttpOnly cookie.

const fetch = require('node-fetch');
const cookie = require('cookie');
const { getDb } = require('../../../lib/db');

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    res.status(400).send('Missing code.');
    return;
  }
  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    res.status(500).send('Missing Discord client credentials.');
    return;
  }

  try {
    // build redirect uri same as in /api/auth/login
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
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const tokenData = await tokenResp.json();
    if (tokenData.error) {
      console.error('Token error', tokenData);
      res.status(500).send('OAuth token error.');
      return;
    }

    const userResp = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userResp.json();
    if (!userData || !userData.id) {
      console.error('User fetch error', userData);
      res.status(500).send('OAuth user fetch error.');
      return;
    }

    // upsert into sqlite
    const db = await getDb();
    const existing = await db.get('SELECT * FROM users WHERE discord_id = ?', [userData.id]);
    if (!existing) {
      await db.run('INSERT INTO users (discord_id, points, messages) VALUES (?, ?, ?)', [userData.id, 10, 0]);
    }
    // upsert meta
    await db.run(`
      INSERT INTO users_meta (discord_id, username, discriminator) VALUES (?, ?, ?)
      ON CONFLICT(discord_id) DO UPDATE SET username = excluded.username, discriminator = excluded.discriminator
    `, [userData.id, userData.username, userData.discriminator]);

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

    // redirect home
    res.writeHead(302, { Location: '/' });
    res.end();
  } catch (err) {
    console.error('OAuth callback error', err);
    res.status(500).send('Server error during OAuth.');
  }
}
