const { computeOrderTotals } = require("./_pricing");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  try {
    const { items, couponCode } = JSON.parse(event.body || "{}");
    const totals = computeOrderTotals(items || [], couponCode);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(totals) };
  } catch (err) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: err.message }) };
  }
};
