// lib/db.js
// Simple serverless-friendly in-memory DB with support for:
// - users (by discord_id or email)
// - purchases
// - link tokens for discord-link flow
// NOTE: ephemeral in serverless environments. Persist to a real DB for production.

let _cache = null;
let _nextPurchaseId = 1;

function nowISOString() { return new Date().toISOString(); }

async function loadIfNeeded() {
  if (_cache) return _cache;
  _cache = {
    usersById: {},        // keyed by our internal user id (string)
    usersByDiscord: {},   // discord_id -> userId
    usersByEmail: {},     // email -> userId
    purchases: [],
    linkTokens: {}        // token -> userId
  };
  return _cache;
}

function genId(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 10);
}

async function getDb() {
  await loadIfNeeded();
  return {
    // create a user record (internal id returned). Use addUserIfNotExist for simpler flows.
    async createUser({ email = null, passwordHash = null, starterCandy = 50, username = null, discriminator = null }) {
      await loadIfNeeded();
      const id = genId('u_');
      _cache.usersById[id] = {
        id,
        email: email ? String(email).toLowerCase() : null,
        passwordHash: passwordHash || null,
        discord_id: null,
        candy: Number(starterCandy || 0),
        messages: 0,
        username: username || null,
        discriminator: discriminator || null,
        created_at: nowISOString()
      };
      if (email) _cache.usersByEmail[String(email).toLowerCase()] = id;
      return { ..._cache.usersById[id] };
    },

    async addUserIfNotExist(discordId, starterCandy = 50) {
      await loadIfNeeded();
      const existingUserId = _cache.usersByDiscord[String(discordId)];
      if (existingUserId) return { ..._cache.usersById[existingUserId] };
      // create new user linked to discord
      const id = genId('u_');
      _cache.usersById[id] = {
        id,
        email: null,
        passwordHash: null,
        discord_id: String(discordId),
        candy: Number(starterCandy),
        messages: 0,
        username: null,
        discriminator: null,
        created_at: nowISOString()
      };
      _cache.usersByDiscord[String(discordId)] = id;
      return { ..._cache.usersById[id] };
    },

    async getUserById(id) {
      await loadIfNeeded();
      return _cache.usersById[String(id)] ? { ..._cache.usersById[String(id)] } : null;
    },

    async getUserByDiscord(discordId) {
      await loadIfNeeded();
      const uid = _cache.usersByDiscord[String(discordId)];
      if (!uid) return null;
      return { ..._cache.usersById[uid] };
    },

    async getUserByEmail(email) {
      await loadIfNeeded();
      if (!email) return null;
      const uid = _cache.usersByEmail[String(email).toLowerCase()];
      if (!uid) return null;
      return { ..._cache.usersById[uid] };
    },

    async upsertMetaByDiscord(discordId, username, discriminator) {
      await loadIfNeeded();
      const s = String(discordId);
      let uid = _cache.usersByDiscord[s];
      if (!uid) {
        // create
        const id = genId('u_');
        _cache.usersById[id] = {
          id,
          email: null,
          passwordHash: null,
          discord_id: s,
          candy: 50,
          messages: 0,
          username: username || null,
          discriminator: discriminator || null,
          created_at: nowISOString()
        };
        _cache.usersByDiscord[s] = id;
        return { ..._cache.usersById[id] };
      } else {
        _cache.usersById[uid].username = username || _cache.usersById[uid].username;
        _cache.usersById[uid].discriminator = discriminator || _cache.usersById[uid].discriminator;
        return { ..._cache.usersById[uid] };
      }
    },

    async linkDiscordToUser(userId, discordId) {
      await loadIfNeeded();
      const uid = String(userId);
      if (!_cache.usersById[uid]) throw new Error('User not found');
      // unlink previous discord mapping if exists
      const old = _cache.usersById[uid].discord_id;
      if (old) delete _cache.usersByDiscord[String(old)];
      _cache.usersById[uid].discord_id = String(discordId);
      _cache.usersByDiscord[String(discordId)] = uid;
      return { ..._cache.usersById[uid] };
    },

    async updateCandyByUserId(userId, newCandy) {
      await loadIfNeeded();
      const uid = String(userId);
      if (!_cache.usersById[uid]) throw new Error('User not found');
      _cache.usersById[uid].candy = Number(newCandy);
      return { ..._cache.usersById[uid] };
    },

    async updateCandyByDiscord(discordId, newCandy) {
      await loadIfNeeded();
      const uid = _cache.usersByDiscord[String(discordId)];
      if (!uid) throw new Error('User not found');
      _cache.usersById[uid].candy = Number(newCandy);
      return { ..._cache.usersById[uid] };
    },

    async giveCandyByUserId(userId, amount, reason = '') {
      await loadIfNeeded();
      const uid = String(userId);
      if (!_cache.usersById[uid]) throw new Error('User not found');
      _cache.usersById[uid].candy = (Number(_cache.usersById[uid].candy) || 0) + Number(amount);
      const p = { id: _nextPurchaseId++, discord_id: _cache.usersById[uid].discord_id, productId: 'admin-give', productName: `admin:${reason}`, price: -Number(amount), status: 'confirmed', created_at: nowISOString() };
      _cache.purchases.push(p);
      return { ..._cache.usersById[uid] };
    },

    async incrementMessagesByDiscord(discordId, by = 1) {
      await loadIfNeeded();
      const uid = _cache.usersByDiscord[String(discordId)];
      if (!uid) {
        // create default
        const created = await this.addUserIfNotExist(discordId, 50);
        _cache.usersById[created.id].messages += Number(by);
        return { ..._cache.usersById[created.id] };
      }
      _cache.usersById[uid].messages = (_cache.usersById[uid].messages || 0) + Number(by);
      // every 50 messages award 1 candy (same as older logic)
      const msgs = _cache.usersById[uid].messages;
      if (msgs % 50 === 0) {
        _cache.usersById[uid].candy = (_cache.usersById[uid].candy || 0) + 1;
      }
      return { ..._cache.usersById[uid] };
    },

    async addPurchase({ discord_id, productId, productName, price }) {
      await loadIfNeeded();
      const id = _nextPurchaseId++;
      const p = { id, discord_id: discord_id || null, productId, productName, price: Number(price), status: 'pending', created_at: nowISOString() };
      _cache.purchases.push(p);
      return { ...p };
    },

    async getPurchases(filter = {}) {
      await loadIfNeeded();
      let list = _cache.purchases.slice();
      if (filter.discord_id) list = list.filter(p => p.discord_id === String(filter.discord_id));
      if (filter.status) list = list.filter(p => p.status === filter.status);
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return list.map(p => ({ ...p }));
    },

    async confirmPurchase(id) {
      await loadIfNeeded();
      const idx = _cache.purchases.findIndex(p => p.id === Number(id));
      if (idx === -1) throw new Error('Purchase not found');
      _cache.purchases[idx].status = 'confirmed';
      _cache.purchases[idx].confirmed_at = nowISOString();
      return { ..._cache.purchases[idx] };
    },

    async getLeaderboard(limit = 10) {
      await loadIfNeeded();
      const arr = Object.values(_cache.usersById || {});
      arr.sort((a, b) => {
        if ((b.candy || 0) !== (a.candy || 0)) return (b.candy || 0) - (a.candy || 0);
        return (b.messages || 0) - (a.messages || 0);
      });
      return arr.slice(0, limit).map(u => ({ ...u }));
    },

    // Link-token helpers (for /link flow)
    async generateLinkTokenForUser(userId, ttlSeconds = 60 * 15) {
      await loadIfNeeded();
      const token = Math.random().toString(36).slice(2, 10).toUpperCase();
      _cache.linkTokens[token] = { userId: String(userId), created_at: nowISOString(), expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString() };
      return token;
    },

    async consumeLinkToken(token) {
      await loadIfNeeded();
      const rec = _cache.linkTokens[String(token)];
      if (!rec) return null;
      if (rec.expires_at && new Date(rec.expires_at) < new Date()) {
        delete _cache.linkTokens[String(token)];
        return null;
      }
      delete _cache.linkTokens[String(token)];
      return rec.userId;
    },

    // login helpers
    async setPasswordForUserId(userId, passwordHash) {
      await loadIfNeeded();
      const uid = String(userId);
      if (!_cache.usersById[uid]) throw new Error('User not found');
      _cache.usersById[uid].passwordHash = passwordHash;
      return { ..._cache.usersById[uid] };
    },

    async registerUserWithEmail(email, passwordHash, starterCandy = 50, username = null) {
      await loadIfNeeded();
      const existing = _cache.usersByEmail[String(email).toLowerCase()];
      if (existing) throw new Error('Email already in use');
      const user = await this.createUser({ email, passwordHash, starterCandy, username });
      return user;
    },

    async verifyEmailPassword(email, passwordHash) {
      await loadIfNeeded();
      const uid = _cache.usersByEmail[String(email).toLowerCase()];
      if (!uid) return null;
      const user = _cache.usersById[uid];
      if (!user) return null;
      if (!user.passwordHash) return null;
      if (user.passwordHash !== passwordHash) return null;
      return { ...user };
    },

    async getAllUsers() {
      await loadIfNeeded();
      return Object.values(_cache.usersById).map(u => ({ ...u }));
    }
  };
}

module.exports = { getDb };
