/**
 * Keeps credentials server-side per the brief. With no EMAIL_API_KEY set,
 * this just logs — so the order flow works out of the box without an email
 * provider. Set EMAIL_API_KEY + EMAIL_FROM to actually send via Resend
 * (https://resend.com); swap the fetch call to use a different provider.
 */
async function sendOrderConfirmationEmail(order) {
  const summary = order.items.map((i) => `${i.qty} x ${i.name} (${i.size})`).join(", ");
  const text = [
    `Order ID: ${order.id}`,
    `Items: ${summary}`,
    `Total: ₹${order.total}`,
    `Payment: ${order.method.toUpperCase()} — ${order.status}`,
    `Delivery address: ${order.customer.address}, ${order.customer.city} ${order.customer.pin}`,
    `Estimated delivery: 2-4 business days`,
  ].join("\n");

  if (!process.env.EMAIL_API_KEY || !order.customer.email) {
    console.log(`[email:stub] Would send confirmation for ${order.id} to ${order.customer.email || "(no email given)"}\n${text}`);
    return { sent: false, reason: "EMAIL_API_KEY not configured or no customer email" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "orders@profuelx.example.com",
        to: order.customer.email,
        subject: `ProfuelX order ${order.id} confirmed`,
        text,
      }),
    });
    if (!res.ok) throw new Error(`Email provider responded ${res.status}`);
    return { sent: true };
  } catch (err) {
    console.warn("[email] send failed:", err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendOrderConfirmationEmail };
