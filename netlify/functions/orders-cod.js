const crypto = require("crypto");
const { computeOrderTotals } = require("./_pricing");
const { validateCustomer } = require("./_validators");
const { decrementStockForOrder, saveOrder } = require("./_store");
const { sendOrderConfirmationEmail } = require("./_email");

const json = (statusCode, obj) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const { customer, items, couponCode } = JSON.parse(event.body || "{}");
    validateCustomer(customer);
    const { lineItems, subtotal, discount, total, appliedCoupon } = computeOrderTotals(items, couponCode);

    await decrementStockForOrder(lineItems);

    const orderId = "COD" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString("hex").toUpperCase();
    const record = {
      status: "cod-pending", method: "cod", customer, items: lineItems,
      subtotal, discount, total, appliedCoupon, createdAt: new Date().toISOString(),
    };
    await saveOrder(orderId, record);
    await sendOrderConfirmationEmail({ id: orderId, ...record });

    return json(200, { orderId, total });
  } catch (err) {
    return json(400, { error: err.message || "Could not place order." });
  }
};
