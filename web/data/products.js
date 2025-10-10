// data/products.js
// Product definitions (packs, cosmetics, boosters).
// Edit this file to add/remove/change products.

module.exports = [
  {
    id: 'bronze_pack',
    name: 'Bronze Pack',
    price: 50,
    description: 'Starter pack: small candy boost and a tiny message booster.',
    rewards: { candy: 5, booster: 'small' }
  },
  {
    id: 'silver_pack',
    name: 'Silver Pack',
    price: 100,
    description: 'Better rewards: more candy, booster and profile badge.',
    rewards: { candy: 15, booster: 'medium', badge: 'silver' }
  },
  {
    id: 'gold_pack',
    name: 'Gold Pack',
    price: 200,
    description: 'Top pack: large candy boost, strong booster, premium badge.',
    rewards: { candy: 40, booster: 'large', badge: 'gold' }
  },

  // example cosmetics / items
  {
    id: 'ghost_hat',
    name: 'Ghost Hat',
    price: 25,
    description: 'Spooky cosmetic for your profile.',
    rewards: { cosmetic: 'ghost_hat' }
  },
  {
    id: 'profile_badge',
    name: 'Profile Badge',
    price: 40,
    description: 'Special badge displayed on the leaderboard.',
    rewards: { badge: 'special' }
  }
];
