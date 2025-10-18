// pages/api/products.js
// Simple endpoint to expose product + pack metadata to the client UI
const products = require('../../data/products.js');
const coupons = require('../../data/coupons.js');

export default function handler(req, res) {
  res.json({ products, coupons });
}
