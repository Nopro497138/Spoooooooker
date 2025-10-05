// web/lib/db.js
// Lightweight SQLite helper used by the Next.js API routes.
// Keeps a single connection in memory across warm lambda instances.

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let dbPromise = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: './data.db',
      driver: sqlite3.Database
    }).then(async (db) => {
      // ensure tables
      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          discord_id TEXT PRIMARY KEY,
          points INTEGER NOT NULL DEFAULT 0,
          messages INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await db.exec(`
        CREATE TABLE IF NOT EXISTS users_meta (
          discord_id TEXT PRIMARY KEY,
          username TEXT,
          discriminator TEXT
        );
      `);
      return db;
    });
  }
  return dbPromise;
}

module.exports = { getDb };
