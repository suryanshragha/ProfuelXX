const { products } = require("./_catalog");
const { getStock } = require("./_store");

exports.handler = async () => {
  const clone = JSON.parse(JSON.stringify(products));
  for (const product of Object.values(clone)) {
    for (const variant of Object.values(product.variants)) {
      variant.stockQuantity = await getStock(variant.sku);
      variant.inStock = variant.stockQuantity > 0;
    }
  }
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(clone) };
};
