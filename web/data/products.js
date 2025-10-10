// data/products.js
// Product definitions (packs, cosmetics, boosters).
// Edit this file to add/remove/change products and whether they require owner confirmation.

module.exports = [
  {
    id: 'bronze_pack',
    name: 'Bronze Pack',
    price: 50,
    description: 'Starter pack: small candy boost and a tiny message booster.',
    rewards: { candy: 5, booster: 'small' },
    require_confirmation: false
  },
  {
    id: 'silver_pack',
    name: 'Silver Pack',
    price: 100,
    description: 'Better rewards: more candy, booster and profile badge.',
    rewards: { candy: 15, booster: 'medium', badge: 'silver' },
    require_confirmation: false
  },
  {
    id: 'gold_pack',
    name: 'Gold Pack',
    price: 200,
    description: 'Top pack: large candy boost, strong booster, premium badge.',
    rewards: { candy: 40, booster: 'large', badge: 'gold' },
    require_confirmation: false
  },

  // example cosmetics / items
  {
    id: 'ghost_hat',
    name: 'Ghost Hat',
    price: 25,
    description: 'Spooky cosmetic for your profile.',
    rewards: { cosmetic: 'ghost_hat' },
    require_confirmation: false
  },
  {
    id: 'profile_badge',
    name: 'Profile Badge',
    price: 40,
    description: 'Special badge displayed on the leaderboard.',
    rewards: { badge: 'special' },
    require_confirmation: false
  }
];
