const Razorpay = require("razorpay");
const crypto = require("crypto");
const { computeOrderTotals } = require("./_pricing");
const { validateCustomer } = require("./_validators");
const { decrementStockForOrder, saveOrder } = require("./_store");

const json = (statusCode, obj) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const { customer, items, couponCode } = JSON.parse(event.body || "{}");
    validateCustomer(customer);
    const { lineItems, subtotal, discount, total, appliedCoupon } = computeOrderTotals(items, couponCode);
    if (total < 1) return json(400, { error: "Order total must be greater than ₹0." });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return json(500, { error: "Payment gateway is not configured on the server yet." });
    }

    await decrementStockForOrder(lineItems);

    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const receipt = "pfx_" + crypto.randomBytes(6).toString("hex");
    const rzpOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt,
      notes: { customer_name: customer.name, customer_phone: customer.phone, coupon: appliedCoupon || "none" },
    });

    await saveOrder(rzpOrder.id, {
      status: "created", method: "online", customer, items: lineItems,
      subtotal, discount, total, appliedCoupon, createdAt: new Date().toISOString(),
    });

    return json(200, { orderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("orders-razorpay-create error:", err);
    return json(400, { error: err.message || "Could not create order." });
  }
};
