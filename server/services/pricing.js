const { findVariant } = require("../data/productCatalog");
const { coupons } = require("../data/coupons");

/**
 * items: [{ productId: "dark-chocolate", size: "45g", qty: 2 }, ...]
 * Throws a descriptive Error on any invalid input — callers should catch
 * and return it as a 400 with err.message.
 */
function computeOrderTotals(items, couponCode) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const lineItems = items.map((raw) => {
    const found = findVariant(raw.productId, raw.size);
    if (!found) throw new Error(`Unknown product/size: ${raw.productId} / ${raw.size}`);
    const qty = Number(raw.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
      throw new Error(`Invalid quantity for ${found.product.name} (${found.variant.size}).`);
    }
    return {
      productId: found.product.id,
      name: found.product.name,
      size: found.variant.size,
      sizeKey: found.sizeKey,
      sku: found.variant.sku,
      price: found.variant.price,
      qty,
      lineTotal: found.variant.price * qty,
    };
  });

  const subtotal = lineItems.reduce((s, l) => s + l.lineTotal, 0);

  let discount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = coupons[String(couponCode).toUpperCase()];
    if (coupon && subtotal >= coupon.minOrder) {
      discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      discount = Math.min(discount, subtotal);
      appliedCoupon = String(couponCode).toUpperCase();
    }
  }

  const total = subtotal - discount;
  return { lineItems, subtotal, discount, total, appliedCoupon };
}

module.exports = { computeOrderTotals };
