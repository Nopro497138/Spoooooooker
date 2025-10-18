// data/coupons.js
// Simple coupon list you (owner) can edit manually.
// Fields:
//  - code: string used by users (case-insensitive)
//  - type: 'percent' or 'fixed'
//  - amount: for percent e.g. 20 means 20% off; for fixed e.g. 10 means 10 candy off
//  - active: boolean
//  - expires: ISO date string or null

module.exports = [
  {
    code: 'HALLOWEEN10',
    type: 'percent',
    amount: 10,
    active: true,
    expires: null
  },
  {
    code: 'BRONZE5',
    type: 'fixed',
    amount: 5,
    active: true,
    expires: null
  },
  {
    code: 'NEWYEAR50',
    type: 'percent',
    amount: 50,
    active: false,
    expires: '2026-01-05T00:00:00.000Z'
  }
];
