// lib/db.js
// Serverless-friendly in-memory DB. Ephemeral: data lost on cold starts.
// Exposes getDb() with methods for users/purchases.

let _cache = null;
let _nextPurchaseId = 1;

function nowISOString(){ return new Date().toISOString(); }

async function loadIfNeeded(){
  if (_cache) return _cache;
  _cache = { users: {}, purchases: [] };
  return _cache;
}

async function getDb(){
  await loadIfNeeded();
  return {
    async getUser(discordId){
      await loadIfNeeded();
      const u = _cache.users[String(discordId)];
      return u ? { ...u } : null;
    },

    // Only set starterCandy if user truly doesn't exist
    async addUserIfNotExist(discordId, starterCandy = 50){
      await loadIfNeeded();
      const id = String(discordId);
      if (!_cache.users[id]){
        _cache.users[id] = {
          discord_id: id,
          candy: Number(starterCandy),
          messages: 0,
          created_at: nowISOString(),
          username: null,
          discriminator: null
        };
      }
      return { ..._cache.users[id] };
    },

    async upsertMeta(discordId, username, discriminator){
      await loadIfNeeded();
      const id = String(discordId);
      if (!_cache.users[id]){
        _cache.users[id] = {
          discord_id: id,
          candy: 0,
          messages: 0,
          created_at: nowISOString(),
          username: username || null,
          discriminator: discriminator || null
        };
      } else {
        _cache.users[id].username = username || _cache.users[id].username;
        _cache.users[id].discriminator = discriminator || _cache.users[id].discriminator;
      }
      return { ..._cache.users[id] };
    },

    async updateCandy(discordId, newCandy){
      await loadIfNeeded();
      const id = String(discordId);
      if (!_cache.users[id]) throw new Error('User not found');
      _cache.users[id].candy = Number(newCandy);
      return { ..._cache.users[id] };
    },

    async giveCandy(discordId, amount, reason = ''){
      await loadIfNeeded();
      const id = String(discordId);
      if (!_cache.users[id]) {
        _cache.users[id] = {
          discord_id: id,
          candy: 0,
          messages: 0,
          created_at: nowISOString(),
          username: null,
          discriminator: null
        };
      }
      _cache.users[id].candy = (Number(_cache.users[id].candy) || 0) + Number(amount);
      const p = {
        id: _nextPurchaseId++,
        discord_id: id,
        productId: 'admin-gift',
        productName: `ADMIN GIFT: ${reason || 'candy'}`,
        price: -Number(amount),
        status: 'confirmed',
        created_at: nowISOString(),
        meta: { admin_action: true }
      };
      _cache.purchases.push(p);
      return { ..._cache.users[id] };
    },

    async incrementMessages(discordId, by = 1){
      await loadIfNeeded();
      const id = String(discordId);
      if (!_cache.users[id]) {
        _cache.users[id] = {
          discord_id: id,
          candy: 0,
          messages: 0,
          created_at: nowISOString(),
          username: null,
          discriminator: null
        };
      }
      _cache.users[id].messages = (_cache.users[id].messages || 0) + Number(by);
      return { ..._cache.users[id] };
    },

    async getLeaderboard(limit = 10){
      await loadIfNeeded();
      const arr = Object.values(_cache.users || {});
      arr.sort((a,b)=>{
        if ((b.candy||0) !== (a.candy||0)) return (b.candy||0) - (a.candy||0);
        return (b.messages||0) - (a.messages||0);
      });
      return arr.slice(0,limit).map(u => ({ ...u }));
    },

    async addPurchase({ discord_id, productId, productName, price }){
      await loadIfNeeded();
      const id = _nextPurchaseId++;
      const p = { id, discord_id: String(discord_id), productId, productName, price: Number(price), status: 'pending', created_at: nowISOString() };
      _cache.purchases.push(p);
      return { ...p };
    },

    async getPurchases(filter = {}){
      await loadIfNeeded();
      let list = _cache.purchases.slice();
      if (filter.discord_id) list = list.filter(p => p.discord_id === String(filter.discord_id));
      if (filter.status) list = list.filter(p => p.status === filter.status);
      list.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
      return list.map(p => ({ ...p }));
    },

    async confirmPurchase(id){
      await loadIfNeeded();
      const idx = _cache.purchases.findIndex(p => p.id === Number(id));
      if (idx === -1) throw new Error('Purchase not found');
      _cache.purchases[idx].status = 'confirmed';
      _cache.purchases[idx].confirmed_at = nowISOString();
      return { ..._cache.purchases[idx] };
    },

    async getAllUsers(){
      await loadIfNeeded();
      return Object.values(_cache.users).map(u => ({ ...u }));
    }
  };
}

module.exports = { getDb };
