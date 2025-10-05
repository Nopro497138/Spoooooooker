// web/lib/db.js
// Simple JSON-backed "DB" to avoid native sqlite dependencies.
// Uses an in-memory cache + atomic writes to data.json and a write queue to avoid races.

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DB_PATH = path.resolve(process.cwd(), 'data.json');

let cache = null;
let writeInProgress = false;
let pendingWrite = false;

async function loadIfNeeded() {
  if (cache) return cache;
  try {
    const raw = await fsp.readFile(DB_PATH, 'utf8');
    cache = JSON.parse(raw);
  } catch (err) {
    // if file doesn't exist or is invalid, start fresh
    cache = { users: {} };
    await flush(); // ensure file created
  }
  return cache;
}

async function flush() {
  // queue up writes so concurrent calls don't stomp each other
  if (writeInProgress) {
    pendingWrite = true;
    return;
  }
  writeInProgress = true;
  try {
    const tmpPath = DB_PATH + '.tmp';
    await fsp.writeFile(tmpPath, JSON.stringify(cache, null, 2), 'utf8');
    await fsp.rename(tmpPath, DB_PATH);
  } finally {
    writeInProgress = false;
    if (pendingWrite) {
      pendingWrite = false;
      // schedule next write microtask
      setImmediate(() => flush());
    }
  }
}

function nowISOString() {
  return new Date().toISOString();
}

async function getDb() {
  await loadIfNeeded();

  return {
    async getUser(discordId) {
      await loadIfNeeded();
      const u = cache.users[String(discordId)];
      if (!u) return null;
      // return a shallow clone to avoid accidental mutation
      return { ...u };
    },

    async ensureUser(discordId) {
      await loadIfNeeded();
      const id = String(discordId);
      if (!cache.users[id]) {
        cache.users[id] = {
          discord_id: id,
          points: 0,
          messages: 0,
          created_at: nowISOString(),
          username: null,
          discriminator: null
        };
        await flush();
      }
      return { ...cache.users[id] };
    },

    async addUserIfNotExist(discordId, starterPoints = 10) {
      await loadIfNeeded();
      const id = String(discordId);
      if (!cache.users[id]) {
        cache.users[id] = {
          discord_id: id,
          points: starterPoints,
          messages: 0,
          created_at: nowISOString(),
          username: null,
          discriminator: null
        };
        await flush();
      }
      return { ...cache.users[id] };
    },

    async upsertMeta(discordId, username, discriminator) {
      await loadIfNeeded();
      const id = String(discordId);
      if (!cache.users[id]) {
        cache.users[id] = {
          discord_id: id,
          points: 0,
          messages: 0,
          created_at: nowISOString(),
          username: username || null,
          discriminator: discriminator || null
        };
      } else {
        cache.users[id].username = username || cache.users[id].username;
        cache.users[id].discriminator = discriminator || cache.users[id].discriminator;
      }
      await flush();
      return { ...cache.users[id] };
    },

    async updatePoints(discordId, newPoints) {
      await loadIfNeeded();
      const id = String(discordId);
      if (!cache.users[id]) throw new Error('User not found');
      cache.users[id].points = Number(newPoints);
      await flush();
      return { ...cache.users[id] };
    },

    async incrementMessages(discordId, by = 1) {
      await loadIfNeeded();
      const id = String(discordId);
      if (!cache.users[id]) {
        cache.users[id] = {
          discord_id: id,
          points: 0,
          messages: 0,
          created_at: nowISOString(),
          username: null,
          discriminator: null
        };
      }
      cache.users[id].messages = (cache.users[id].messages || 0) + Number(by);
      await flush();
      return { ...cache.users[id] };
    },

    async getLeaderboard(limit = 10) {
      await loadIfNeeded();
      const arr = Object.values(cache.users || {});
      arr.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return (b.messages || 0) - (a.messages || 0);
      });
      return arr.slice(0, limit).map(u => ({ ...u }));
    },

    async getAllUsers() {
      await loadIfNeeded();
      return Object.values(cache.users).map(u => ({ ...u }));
    }
  };
}

module.exports = { getDb };
