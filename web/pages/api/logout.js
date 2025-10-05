// web/pages/api/logout.js
// Clears the session cookie and redirects to home.

const cookie = require('cookie');

export default function handler(req, res) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieStr = cookie.serialize('discord_id', '', {
    httpOnly: true,
    secure: isProd,
    path: '/',
    maxAge: 0,
    sameSite: 'lax'
  });
  res.setHeader('Set-Cookie', cookieStr);
  res.writeHead(302, { Location: '/' });
  res.end();
}
