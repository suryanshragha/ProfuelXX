const express = require("express");
const router = express.Router();

/**
 * DEMO ONLY. There is no real courier/serviceability API wired up here —
 * the brief explicitly says not to fabricate live courier data. This just
 * validates the PIN format and returns a deterministic demo response so the
 * UI component has something real to call. Replace with an actual
 * serviceability API (Shiprocket, Delhivery, etc.) before launch.
 */
router.post("/check", (req, res) => {
  const pin = String(req.body.pin || "").trim();
  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ ok: false, message: "Enter a valid 6-digit PIN code." });
  }
  if (pin.startsWith("0")) {
    return res.json({ ok: false, message: "Delivery availability could not be confirmed for this PIN code." });
  }
  return res.json({ ok: true, message: "Delivery available", etaDays: "2-4 business days", demo: true });
});

module.exports = router;
