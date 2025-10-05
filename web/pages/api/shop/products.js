// web/pages/api/shop/products.js
const PRODUCTS = require('../../../data/products')

export default function handler(req, res) {
  res.json({ products: PRODUCTS })
}
