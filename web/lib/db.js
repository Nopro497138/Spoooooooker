// lib/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(process.cwd(), 'db.sqlite');  // SQLite-Datei

let db;

function openDb() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Failed to open database:", err.message);
      }
    });
  }
  return db;
}

module.exports = {
  openDb,
};
