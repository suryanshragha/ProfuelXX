const express = require("express");
const crypto = require("crypto");
const { computeOrderTotals } = require("../services/pricing");
const { validateCustomer, badRequest } = require("../utils/validators");
const { getRazorpay } = require("../services/razorpay");
const { sendOrderConfirmationEmail } = require("../services/email");
const db = require("../db");

const router = express.Router();

function newOrderId(prefix) {
  return prefix + Date.now().toString(36).toUpperCase() + crypto.randomBytes(3).toString("hex").toUpperCase();
}

// ---- Preview totals (cart drawer / checkout summary) -------------------
// Read-only: computes authoritative subtotal/discount/total without
// creating an order or touching stock, so the client never has to
// duplicate pricing or coupon logic itself.
router.post("/preview", (req, res, next) => {
  try {
    const { items, couponCode } = req.body;
    const totals = computeOrderTotals(items || [], couponCode);
    res.json(totals);
  } catch (err) {
    next(err);
  }
});

// ---- Cash on delivery -------------------------------------------------
router.post("/cod", async (req, res, next) => {
  try {
    const { customer, items, couponCode } = req.body;
    validateCustomer(customer);
    const { lineItems, subtotal, discount, total, appliedCoupon } = computeOrderTotals(items, couponCode);

    db.decrementStockForOrder(lineItems); // throws if any variant is out of stock

    const id = newOrderId("COD");
    const order = {
      id,
      status: "cod-pending",
      method: "cod",
      customer_json: JSON.stringify(customer),
      items_json: JSON.stringify(lineItems),
      subtotal,
      discount,
      total,
      coupon_code: appliedCoupon,
      created_at: new Date().toISOString(),
    };
    db.createOrder(order);

    const full = db.getOrder(id);
    await sendOrderConfirmationEmail(full);

    res.json({ orderId: id, total });
  } catch (err) {
    next(err);
  }
});

// ---- Razorpay: create order -------------------------------------------
router.post("/razorpay/create", async (req, res, next) => {
  try {
    const { customer, items, couponCode } = req.body;
    validateCustomer(customer);
    const { lineItems, subtotal, discount, total, appliedCoupon } = computeOrderTotals(items, couponCode);
    if (total < 1) throw badRequest("Order total must be greater than ₹0.");

    db.decrementStockForOrder(lineItems); // reserve stock up front; restored if payment fails/cancels

    const razorpay = getRazorpay();
    const receipt = newOrderId("R");
    const rzpOrder = await razorpay.orders.create({
      amount: total * 100, // paise
      currency: "INR",
      receipt,
      notes: { customer_name: customer.name, customer_phone: customer.phone, coupon: appliedCoupon || "none" },
    });

    db.createOrder({
      id: rzpOrder.id,
      status: "created",
      method: "online",
      customer_json: JSON.stringify(customer),
      items_json: JSON.stringify(lineItems),
      subtotal,
      discount,
      total,
      coupon_code: appliedCoupon,
      created_at: new Date().toISOString(),
    });

    res.json({ orderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    next(err);
  }
});

// ---- Razorpay: verify signature, mark paid -----------------------------
router.post("/razorpay/verify", async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw badRequest("Missing payment details.");
    }
    if (!process.env.RAZORPAY_KEY_SECRET) throw badRequest("Payment gateway is not configured.");

    const existing = db.getOrder(razorpay_order_id);
    if (!existing) throw badRequest("Order not found.");

    // Idempotent: if we already verified this order, don't re-process it.
    if (existing.status === "paid") {
      return res.json({ ok: true, orderId: razorpay_order_id, alreadyProcessed: true });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const valid =
      expected.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));

    if (!valid) {
      db.updateOrder(razorpay_order_id, { status: "verification_failed" });
      throw badRequest("Payment verification failed.");
    }

    const updated = db.updateOrder(razorpay_order_id, {
      status: "paid",
      razorpay_payment_id,
      paid_at: new Date().toISOString(),
    });
    await sendOrderConfirmationEmail(updated);

    res.json({ ok: true, orderId: razorpay_order_id });
  } catch (err) {
    next(err);
  }
});

// ---- Cancel/failure: release reserved stock ----------------------------
router.post("/razorpay/release", (req, res) => {
  const { orderId } = req.body;
  const order = db.getOrder(orderId);
  if (order && order.status !== "paid") {
    db.restoreStockForOrder(order.items);
    db.updateOrder(orderId, { status: "cancelled" });
  }
  res.json({ ok: true });
});

// ---- Order lookup (tracking / success page refresh) --------------------
router.get("/:id", (req, res) => {
  const order = db.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found." });
  const { customer_json, items_json, ...rest } = order; // eslint-disable-line no-unused-vars
  res.json(rest);
});

module.exports = router;
