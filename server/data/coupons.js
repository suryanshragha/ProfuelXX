/** Sample coupons — server-validated, never trusted from the client. */
const coupons = {
  FUEL10: { type: "percent", value: 10, minOrder: 300, label: "10% off orders above ₹300" },
  WELCOME50: { type: "flat", value: 50, minOrder: 400, label: "₹50 off orders above ₹400" },
  PACK15: { type: "percent", value: 15, minOrder: 0, maxDiscount: 150, label: "15% off, up to ₹150" },
};

module.exports = { coupons };
