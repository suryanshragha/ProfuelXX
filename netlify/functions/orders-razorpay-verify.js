const crypto = require("crypto");
const { getOrder, saveOrder } = require("./_store");
const { sendOrderConfirmationEmail } = require("./_email");

const json = (statusCode, obj) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body || "{}");
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json(400, { error: "Missing payment details." });
    }
    if (!process.env.RAZORPAY_KEY_SECRET) return json(500, { error: "Payment gateway is not configured on the server yet." });

    const existing = await getOrder(razorpay_order_id);
    if (!existing) return json(400, { error: "Order not found." });
    if (existing.status === "paid") return json(200, { ok: true, orderId: razorpay_order_id, alreadyProcessed: true });

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const valid =
      expected.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));

    if (!valid) {
      await saveOrder(razorpay_order_id, { ...existing, status: "verification_failed" });
      return json(400, { error: "Payment verification failed." });
    }

    const paid = { ...existing, status: "paid", paymentId: razorpay_payment_id, paidAt: new Date().toISOString() };
    await saveOrder(razorpay_order_id, paid);
    await sendOrderConfirmationEmail({ id: razorpay_order_id, ...paid });
    return json(200, { ok: true, orderId: razorpay_order_id });
  } catch (err) {
    console.error("orders-razorpay-verify error:", err);
    return json(400, { error: err.message || "Could not verify payment." });
  }
};
