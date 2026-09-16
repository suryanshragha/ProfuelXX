const express = require("express");
const { products } = require("../data/productCatalog");
const { getStock } = require("../db");

const router = express.Router();

function withLiveStock() {
  const clone = JSON.parse(JSON.stringify(products));
  Object.values(clone).forEach((product) => {
    Object.values(product.variants).forEach((variant) => {
      variant.stockQuantity = getStock(variant.sku);
      variant.inStock = variant.stockQuantity > 0;
    });
  });
  return clone;
}

router.get("/", (req, res) => {
  res.json(withLiveStock());
});

module.exports = router;
