// pages/api/auth/logout.js
export default async function handler(req, res) {
  // clear session cookie
  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', require('cookie').serialize('session', '', { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', expires: new Date(0) }));
  res.json({ ok: true });
}
