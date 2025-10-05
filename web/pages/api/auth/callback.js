// web/pages/api/auth/callback.js
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
    res.status(500).send('Server configuration error: missing DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET.');
    return;
  }

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

    const tokenResp = await globalThis.fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    const tokenData = await tokenResp.json();

    if (!tokenResp.ok) {
      console.error('Token exchange failed', tokenData);
      // Give a clear message to help debug redirect_uri mismatches and missing envs.
      const msg = tokenData?.error_description || tokenData?.error || 'Unknown token exchange error';
      res.status(502).send(`Server error during OAuth (token exchange): ${msg}. Make sure your Redirect URI in the Discord Developer Portal exactly matches: ${redirect_uri}`);
      return;
    }

    if (!tokenData.access_token) {
      console.error('No access_token in response', tokenData);
      res.status(502).send('Server error during OAuth: no access token returned.');
      return;
    }

    const userResp = await globalThis.fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Accept': 'application/json' }
    });
    const userData = await userResp.json();
    if (!userResp.ok || !userData || !userData.id) {
      console.error('User fetch error', userData);
      res.status(502).send('Server error during OAuth (fetch user).');
      return;
    }

    // Upsert in JSON DB and give starter 50 points if new
    const db = await getDb();
    await db.addUserIfNotExist(userData.id, 50);
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

    // redirect home
    res.writeHead(302, { Location: '/' });
    res.end();
  } catch (err) {
    console.error('OAuth callback error', err);
    // show a helpful but not excessive message
    res.status(500).send('Server error during OAUTH. Check server logs and ensure DISCORD_CLIENT_ID/SECRET and the Redirect URI are correctly configured.');
  }
}
