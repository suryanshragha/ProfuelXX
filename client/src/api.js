const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export const api = {
  getProducts: () => request("/products"),
  previewOrder: (payload) => request("/orders/preview", { method: "POST", body: JSON.stringify(payload) }),
  checkDelivery: (pin) => request("/delivery/check", { method: "POST", body: JSON.stringify({ pin }) }),
  placeCodOrder: (payload) => request("/orders/cod", { method: "POST", body: JSON.stringify(payload) }),
  createRazorpayOrder: (payload) => request("/orders/razorpay/create", { method: "POST", body: JSON.stringify(payload) }),
  verifyRazorpayPayment: (payload) => request("/orders/razorpay/verify", { method: "POST", body: JSON.stringify(payload) }),
  releaseRazorpayOrder: (orderId) => request("/orders/razorpay/release", { method: "POST", body: JSON.stringify({ orderId }) }),
  getOrder: (id) => request(`/orders/${id}`),
};
