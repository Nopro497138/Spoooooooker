// lib/auth.js
// small auth helpers: password hashing and JWT session creation/verify
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const SECRET = process.env.SESSION_SECRET || 'change_this_in_prod';

function hashPassword(password, salt = null) {
  if (!salt) salt = crypto.randomBytes(12).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  const [salt, hash] = stored.split('$');
  const attempt = crypto.pbkdf2Sync(String(password), salt, 100000, 64, 'sha512').toString('hex');
  return attempt === hash;
}

function createSessionToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

function verifySessionToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, createSessionToken, verifySessionToken };
