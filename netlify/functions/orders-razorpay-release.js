const { getOrder, saveOrder, restoreStockForOrder } = require("./_store");

const json = (statusCode, obj) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  const { orderId } = JSON.parse(event.body || "{}");
  const order = await getOrder(orderId);
  if (order && order.status !== "paid") {
    await restoreStockForOrder(order.items);
    await saveOrder(orderId, { ...order, status: "cancelled" });
  }
  return json(200, { ok: true });
};
