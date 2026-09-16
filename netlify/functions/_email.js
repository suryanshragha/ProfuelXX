async function sendOrderConfirmationEmail(order) {
  const summary = order.items.map((i) => `${i.qty} x ${i.name} (${i.size})`).join(", ");
  const text = [
    `Order ID: ${order.id || order.orderId}`,
    `Items: ${summary}`,
    `Total: ₹${order.total}`,
    `Payment: ${order.method.toUpperCase()} — ${order.status}`,
    `Delivery address: ${order.customer.address}, ${order.customer.city} ${order.customer.pin}`,
    `Estimated delivery: 2-4 business days`,
  ].join("\n");

  if (!process.env.EMAIL_API_KEY || !order.customer.email) {
    console.log(`[email:stub] Would send confirmation to ${order.customer.email || "(no email given)"}\n${text}`);
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.EMAIL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "orders@profuelx.example.com",
        to: order.customer.email,
        subject: `ProfuelX order ${order.id || order.orderId} confirmed`,
        text,
      }),
    });
  } catch (err) {
    console.warn("[email] send failed:", err.message);
  }
}

module.exports = { sendOrderConfirmationEmail };
