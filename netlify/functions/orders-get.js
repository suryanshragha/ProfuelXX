const { getOrder } = require("./_store");

exports.handler = async (event) => {
  const id = event.queryStringParameters?.id;
  if (!id) return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Missing order id." }) };
  const order = await getOrder(id);
  if (!order) return { statusCode: 404, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Order not found." }) };
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) };
};
