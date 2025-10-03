// app.js - single file Halloween Galaxy web app (frontend + backend)
// Usage: set env vars DATABASE_URL, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, WEBSITE_URL
// Deploy: Railway, Render, Heroku recommended for single-file server

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const WEBSITE_URL = process.env.WEBSITE_URL || `http://localhost:${PORT}`;

if (!DATABASE_URL || !DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
  console.error("Missing required env vars. Set DATABASE_URL, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET.");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

// Ensure table
(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        discord_id BIGINT PRIMARY KEY,
        points INTEGER NOT NULL DEFAULT 0,
        messages INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("DB ready.");
  } finally {
    client.release();
  }
})();

// Helper cookie/session (very simple): store discord_id in an HttpOnly cookie
function setSessionCookie(res, discordId) {
  // 30 days
  res.cookie('discord_id', String(discordId), {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  });
}

// Simple HTML page (single file) with inline CSS & JS (Halloween Galaxy style)
function renderHomeHtml(userData) {
  const loggedIn = !!userData;
  const username = userData ? `${userData.username}#${userData.discriminator}` : '';
  const points = userData ? userData.points : 0;
  const clientId = DISCORD_CLIENT_ID;
  const redirect = encodeURIComponent(`${WEBSITE_URL}/auth/callback`);
  const loginUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=identify`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Halloween Galaxy — Planko</title>
<link rel="icon" href="data:," />
<style>
  :root{
    --bg-1:#070708;--bg-2:#0f0f11;--accent:#ff5f5f;--muted:rgba(255,255,255,0.6);
  }
  html,body,#root{height:100%}
  body{
    margin:0;font-family:Inter,system-ui,Segoe UI,Roboto,Arial;background:
    radial-gradient(circle at 8% 12%, rgba(255,80,80,0.12), transparent 6%),
    radial-gradient(circle at 92% 88%, rgba(255,80,80,0.12), transparent 8%),
    linear-gradient(180deg,var(--bg-1),var(--bg-2));
    color:#e6e6e6;
    display:flex;align-items:center;justify-content:center;padding:24px;
  }
  .card{
    width:100%;max-width:940px;padding:28px;border-radius:14px;
    background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border:1px solid rgba(255,255,255,0.03);
    box-shadow:0 8px 40px rgba(0,0,0,0.6);
    backdrop-filter: blur(6px);
  }
  .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
  h1{margin:0;font-size:28px;color:var(--accent);text-shadow:0 2px 8px rgba(0,0,0,0.6)}
  p.lead{margin:6px 0 0;color:var(--muted)}
  .right{text-align:right}
  .points{font-weight:700;font-size:26px;color:#fff}
  .btn{
    display:inline-block;padding:10px 16px;border-radius:10px;text-decoration:none;
    background:linear-gradient(180deg,var(--accent),#ff3f3f);color:#111;font-weight:700;
    box-shadow:0 6px 18px rgba(255,95,95,0.12);
  }
  .muted{color:var(--muted);font-size:13px}
  .row{display:flex;gap:12px;align-items:center}
  .input{padding:10px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,0.06);color:#fff;min-width:140px}
  .result{margin-top:12px;padding:12px;border-radius:10px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.03)}
  footer{margin-top:16px;text-align:center;color:var(--muted);font-size:13px}
  .small{font-size:13px;color:var(--muted)}
  @media(max-width:720px){
    .header{flex-direction:column;align-items:flex-start;gap:12px}
    .right{text-align:left;width:100%}
  }
</style>
</head>
<body>
  <div class="card" id="root">
    <div class="header">
      <div>
        <h1>Halloween Galaxy — Planko</h1>
        <p class="lead">A spooky galaxy-themed arcade — no real money. Use Halloween Points to play.</p>
      </div>
      <div class="right">
        ${ loggedIn ? `
          <div class="small">Logged in as</div>
          <div class="points">${escapeHtml(username)}</div>
          <div class="small">Halloween Points: <strong style="color:var(--accent)">${points}</strong></div>
        ` : `
          <a class="btn" href="${loginUrl}">Sign in with Discord</a>
          <div class="small" style="margin-top:6px">You get <strong>10</strong> starter points on first link.</div>
        `}
      </div>
    </div>

    <hr style="opacity:0.06;border:none;height:1px;margin:12px 0 18px;background:linear-gradient(to right,transparent,#333,transparent)">

    <div>
      <h3 style="margin:0 0 6px">Planko — Quick Rules</h3>
      <p class="muted" style="margin:0 0 12px">Place a bet in Halloween Points. Random roll decides outcome. Win multipliers applied to your bet.</p>

      ${ loggedIn ? `
        <form id="plankoForm" onsubmit="return false;">
          <div class="row">
            <input id="bet" class="input" type="number" min="1" value="1" />
            <button id="playBtn" class="btn">Play Planko</button>
            <div style="margin-left:auto" class="small">Your points: <strong style="color:var(--accent)">${points}</strong></div>
          </div>
        </form>

        <div id="result" class="result" style="display:none"></div>
      ` : `
        <div class="muted">Sign in to play Planko and spend your Halloween Points. Earn points on Discord: every 50 messages = 1 point.</div>
      `}

      <div style="margin-top:12px" class="small">Tip: The system is connected to Discord — linking uses OAuth and stores your Discord ID only to track points.</div>
    </div>

    <footer>
      <div>Built with spooky vibes • Halloween Galaxy</div>
    </footer>
  </div>

<script>
  // Minimal client script for Planko interactions
  ${ loggedIn ? `
  async function postJSON(url, body){
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    return res.json();
  }

  const form = document.getElementById('plankoForm');
  const betInput = document.getElementById('bet');
  const playBtn = document.getElementById('playBtn');
  const resultDiv = document.getElementById('result');

  playBtn.addEventListener('click', async () => {
    playBtn.disabled = true;
    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';
    const bet = Number(betInput.value || 0);
    if (!bet || bet <= 0) {
      alert('Please enter a valid bet.');
      playBtn.disabled = false;
      return;
    }

    try {
      const data = await postJSON('/api/planko', { bet });
      if (data.error) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<div style="color:#ff7a7a"><strong>Error:</strong> ' + data.error + '</div>';
      } else {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<div><strong>Outcome:</strong> ' + data.outcome + '</div>' +
                              '<div><strong>Multiplier:</strong> ' + data.multiplier + 'x</div>' +
                              '<div><strong>Change:</strong> ' + (data.change >= 0 ? '+'+data.change : data.change) + ' points</div>' +
                              '<div><strong>New balance:</strong> ' + data.newPoints + '</div>';
        // update displayed points
        const pointsNode = document.querySelector('.right .points') || document.querySelector('.right .small strong');
        if (pointsNode) pointsNode.textContent = data.newPoints;
      }
    } catch (err) {
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = '<div style="color:#ff7a7a"><strong>Error:</strong> Unexpected error</div>';
      console.error(err);
    } finally {
      playBtn.disabled = false;
    }
  });
  ` : ''}
  // small escape helper (server-side) - already escaped username but keep safe
  function escapeHtml(s){ return s.replace(/[&<>"]/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]); }
</script>
</body>
</html>`;
}

// simple escape for server-inserted strings
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]);
}

// ROUTES

// Home page: read cookie, if logged in fetch small user info from DB + Discord API to show username discriminator
app.get('/', async (req, res) => {
  const discordId = req.cookies.discord_id;
  if (!discordId) {
    res.send(renderHomeHtml(null));
    return;
  }

  const client = await pool.connect();
  try {
    const r = await client.query("SELECT discord_id, points FROM users WHERE discord_id = $1", [discordId]);
    if (r.rowCount === 0) {
      // session cookie but no DB row => create starter row with 10 points
      await client.query("INSERT INTO users (discord_id, points, messages) VALUES ($1, $2, $3)", [discordId, 10, 0]);
      const userObj = { discord_id: discordId, points: 10, username: 'Discord User', discriminator: '' };
      res.send(renderHomeHtml(userObj));
      return;
    }
    const points = r.rows[0].points;

    // fetch display name from Discord to show e.g. username#discrim (best-effort)
    let username = null;
    try {
      // if you had a token saved you'd fetch /users/@me; we don't store token; so we'll just display ID
      // Optionally you could store username during OAuth exchange (we do that below)
      const metaR = await client.query("SELECT username, discriminator FROM users_meta WHERE discord_id = $1", [discordId]);
      if (metaR && metaR.rowCount > 0) {
        username = metaR.rows[0].username + '#' + metaR.rows[0].discriminator;
      }
    } catch(e){ /* ignore */ }

    const userObj = { discord_id: discordId, points, username: username || ('User ' + discordId), discriminator: '' };
    res.send(renderHomeHtml(userObj));
  } finally {
    client.release();
  }
});

// Redirect to Discord OAuth (optional convenience endpoint)
app.get('/auth/login', (req, res) => {
  const redirect = encodeURIComponent(`${WEBSITE_URL}/auth/callback`);
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify`;
  res.redirect(url);
});

// OAuth callback - exchanges code for token and fetches user data, creates/updates DB row, sets cookie
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code.');

  try {
    const params = new URLSearchParams();
    params.append('client_id', DISCORD_CLIENT_ID);
    params.append('client_secret', DISCORD_CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', `${WEBSITE_URL}/auth/callback`);
    params.append('scope', 'identify');

    const tokenResp = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const tokenData = await tokenResp.json();
    if (tokenData.error) {
      console.error('Token error', tokenData);
      return res.status(500).send('OAuth error (token).');
    }

    const userResp = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userResp.json();
    if (!userData || !userData.id) {
      console.error('User fetch error', userData);
      return res.status(500).send('OAuth error (fetch user).');
    }

    const client = await pool.connect();
    try {
      // ensure users table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          discord_id BIGINT PRIMARY KEY,
          points INTEGER NOT NULL DEFAULT 0,
          messages INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `);
      // optional small meta table to store username/discriminator for display
      await client.query(`
        CREATE TABLE IF NOT EXISTS users_meta (
          discord_id BIGINT PRIMARY KEY,
          username TEXT,
          discriminator TEXT
        );
      `);

      // if new user -> give starter 10 points
      const r = await client.query("SELECT * FROM users WHERE discord_id = $1", [userData.id]);
      if (r.rowCount === 0) {
        await client.query("INSERT INTO users (discord_id, points, messages) VALUES ($1, $2, $3)", [userData.id, 10, 0]);
      }
      // upsert meta
      await client.query(`
        INSERT INTO users_meta (discord_id, username, discriminator) VALUES ($1, $2, $3)
        ON CONFLICT (discord_id) DO UPDATE SET username = EXCLUDED.username, discriminator = EXCLUDED.discriminator
      `, [userData.id, userData.username, userData.discriminator]);

      // set cookie session
      setSessionCookie(res, userData.id);

      // redirect home
      res.redirect('/');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during OAuth.');
  }
});

// API: return small user payload (used by client if needed)
app.get('/api/user', async (req, res) => {
  const discordId = req.cookies.discord_id;
  if (!discordId) return res.json({});
  const client = await pool.connect();
  try {
    const r = await client.query("SELECT u.discord_id, u.points, u.messages, m.username, m.discriminator FROM users u LEFT JOIN users_meta m ON u.discord_id = m.discord_id WHERE u.discord_id = $1", [discordId]);
    if (r.rowCount === 0) return res.json({});
    const row = r.rows[0];
    res.json({
      discord_id: row.discord_id,
      points: row.points,
      messages: row.messages,
      username: row.username || null,
      discriminator: row.discriminator || null
    });
  } finally {
    client.release();
  }
});

// API: play planko
app.post('/api/planko', async (req, res) => {
  const discordId = req.cookies.discord_id;
  if (!discordId) return res.status(401).json({ error: 'Not authenticated. Please sign in with Discord.' });

  const betRaw = req.body.bet;
  const bet = Number(betRaw);
  if (!bet || isNaN(bet) || bet <= 0) return res.status(400).json({ error: 'Invalid bet amount.' });

  const client = await pool.connect();
  try {
    const r = await client.query("SELECT points FROM users WHERE discord_id = $1 FOR UPDATE", [discordId]);
    if (r.rowCount === 0) return res.status(400).json({ error: 'User not found.' });
    let points = r.rows[0].points;

    if (bet > points) return res.status(400).json({ error: 'Insufficient points.' });

    // roll logic (same distribution as earlier)
    const roll = Math.floor(Math.random() * 1000); // 0..999
    let multiplier = 0;
    let outcome = 'Lose';
    if (roll < 700) { multiplier = 0; outcome = 'Lose'; }
    else if (roll < 900) { multiplier = 1.5; outcome = 'Small win'; }
    else if (roll < 970) { multiplier = 2; outcome = 'Nice win'; }
    else { multiplier = 5; outcome = 'Jackpot!'; }

    const won = Math.floor(multiplier * bet);
    const change = won - bet; // can be negative (if lose)
    const newPoints = points - bet + Math.max(0, won);

    // atomic update
    await client.query("UPDATE users SET points = $1 WHERE discord_id = $2", [newPoints, discordId]);

    res.json({
      outcome,
      multiplier,
      change,
      newPoints
    });
  } catch (err) {
    console.error('Planko error', err);
    res.status(500).json({ error: 'Server error.' });
  } finally {
    client.release();
  }
});

// small endpoint to logout (clear cookie)
app.get('/auth/logout', (req, res) => {
  res.clearCookie('discord_id');
  res.redirect('/');
});

// start server
app.listen(PORT, () => {
  console.log(`Halloween Planko single-file app running on port ${PORT}`);
  console.log(`Make sure your Discord Redirect URI is: ${WEBSITE_URL}/auth/callback`);
});
