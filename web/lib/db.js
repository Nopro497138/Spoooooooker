// web/lib/db.js
// Simple JSON-backed "DB" with user + purchases support.
// Provides: getUser, ensureUser, addUserIfNotExist, upsertMeta, updatePoints, incrementMessages,
// getLeaderboard, addPurchase, getPurchases, confirmPurchase, givePoints

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
    // ensure shapes
    cache.users = cache.users || {};
    cache.purchases = cache.purchases || [];
    cache._nextPurchaseId = cache._nextPurchaseId || 1;
  } catch (err) {
    cache = { users: {}, purchases: [], _nextPurchaseId: 1 };
    await flush();
  }
  return cache;
}

async function flush() {
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
      return u ? { ...u } : null;
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

    async givePoints(discordId, amount, reason = '') {
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
      cache.users[id].points = (Number(cache.users[id].points) || 0) + Number(amount);
      // record a "system purchase-like" entry for auditing
      cache.purchases.push({
        id: cache._nextPurchaseId++,
        discord_id: id,
        productId: 'admin-gift',
        productName: `ADMIN GIFT: ${reason || 'points'}`,
        price: -Number(amount),
        status: 'confirmed',
        created_at: nowISOString(),
        meta: { admin_action: true }
      });
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
    },

    // Purchases
    async addPurchase({ discord_id, productId, productName, price }) {
      await loadIfNeeded();
      const id = cache._nextPurchaseId++;
      const p = {
        id,
        discord_id: String(discord_id),
        productId,
        productName,
        price: Number(price),
        status: 'pending',
        created_at: nowISOString()
      };
      cache.purchases.push(p);
      await flush();
      return { ...p };
    },

    async getPurchases(filter = {}) {
      await loadIfNeeded();
      let list = cache.purchases.slice();
      if (filter.discord_id) list = list.filter(p => p.discord_id === String(filter.discord_id));
      if (filter.status) list = list.filter(p => p.status === filter.status);
      // newest first
      list.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
      return list.map(p => ({ ...p }));
    },

    async confirmPurchase(id) {
      await loadIfNeeded();
      const idx = cache.purchases.findIndex(p => p.id === Number(id));
      if (idx === -1) throw new Error('Purchase not found');
      cache.purchases[idx].status = 'confirmed';
      cache.purchases[idx].confirmed_at = nowISOString();
      await flush();
      return { ...cache.purchases[idx] };
    }
  };
}

module.exports = { getDb };
