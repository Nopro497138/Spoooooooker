// data/products.js
// Product definitions (packs, cosmetics, boosters).
// `require_confirmation`: when true owner must confirm; when false and `auto_candy` present, the candy is granted immediately.
// Keep non-pack items simple (no automatic rewards) so owner can handle them manually.

module.exports = [
  {
    id: 'bronze_pack',
    name: 'Bronze Pack',
    price: 50,
    description: 'Starter pack: small candy boost.',
    auto_candy: 5,
    require_confirmation: false
  },
  {
    id: 'silver_pack',
    name: 'Silver Pack',
    price: 100,
    description: 'Silver: more candy and a medium booster (owner handled).',
    auto_candy: 15,
    require_confirmation: true
  },
  {
    id: 'gold_pack',
    name: 'Gold Pack',
    price: 200,
    description: 'Gold pack: large candy. Owner confirms some extras.',
    auto_candy: 40,
    require_confirmation: true
  },

  // shop-only items without automatic rewards (owner handles distributions)
  {
    id: 'ghost_hat',
    name: 'Ghost Hat (manual)',
    price: 25,
    description: 'Cosmetic - owner will deliver after confirming.',
    require_confirmation: true
  },
  {
    id: 'profile_badge',
    name: 'Profile Badge (manual)',
    price: 40,
    description: 'Special badge, owner will add this on confirm.',
    require_confirmation: true
  }
];
