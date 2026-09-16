exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  const body = JSON.parse(event.body || "{}");
  const pin = String(body.pin || "").trim();
  const json = (statusCode, obj) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });

  if (!/^\d{6}$/.test(pin)) return json(400, { ok: false, message: "Enter a valid 6-digit PIN code." });
  if (pin.startsWith("0")) return json(200, { ok: false, message: "Delivery availability could not be confirmed for this PIN code." });
  return json(200, { ok: true, message: "Delivery available", etaDays: "2-4 business days", demo: true });
};
