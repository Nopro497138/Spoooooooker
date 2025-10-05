// web/lib/db.js
// SQLite helper without the "sqlite" package — uses only sqlite3 and provides async get/all/run/exec methods.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let dbPromise = null;

function makeAsyncDb(db) {
  return {
    get(sql, params = []) {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });
    },
    all(sql, params = []) {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
    },
    run(sql, params = []) {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) return reject(err);
          // return result-like object for lastID / changes
          resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    },
    exec(sql) {
      return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        db.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
  };
}

async function getDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const dbPath = path.resolve(process.cwd(), 'data.db');
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) return reject(err);
      const asyncDb = makeAsyncDb(db);
      // ensure tables exist
      (async () => {
        try {
          await asyncDb.exec(`
            CREATE TABLE IF NOT EXISTS users (
              discord_id TEXT PRIMARY KEY,
              points INTEGER NOT NULL DEFAULT 0,
              messages INTEGER NOT NULL DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await asyncDb.exec(`
            CREATE TABLE IF NOT EXISTS users_meta (
              discord_id TEXT PRIMARY KEY,
              username TEXT,
              discriminator TEXT
            );
          `);
          resolve(asyncDb);
        } catch (e) {
          reject(e);
        }
      })();
    });
  });
  return dbPromise;
}

module.exports = { getDb };
