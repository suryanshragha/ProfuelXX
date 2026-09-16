import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart, money } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api";
import { track } from "../analytics";

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load the payment gateway. Check your connection and try again."));
    document.body.appendChild(script);
  });
}

const initialForm = { name: "", phone: "", email: "", address: "", city: "", state: "", pin: "" };
const validators = {
  name: (v) => v.trim().length > 1,
  phone: (v) => /^[6-9]\d{9}$/.test(v.trim()),
  email: (v) => v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  address: (v) => v.trim().length > 5,
  city: (v) => v.trim().length > 1,
  state: (v) => v.trim().length > 1,
  pin: (v) => /^\d{6}$/.test(v.trim()),
};

export default function Checkout() {
  const { lines, totals, coupon, clear } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [method, setMethod] = useState("online");
  const [loading, setLoading] = useState(false);

  useEffect(() => { track("begin_checkout", { itemCount: lines.length }); }, [lines.length]);

  if (!lines.length) {
    return (
      <div className="wrap section">
        <div className="empty-state">Your cart is empty. <Link to="/">Browse products</Link></div>
      </div>
    );
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const nextErrors = {};
    Object.keys(validators).forEach((field) => {
      if (!validators[field](form[field])) nextErrors[field] = true;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function cartPayload() {
    return { items: lines.map(({ productId, size, qty }) => ({ productId, size, qty })), couponCode: coupon || null };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) { toast("Please check the highlighted fields.", true); return; }

    setLoading(true);
    track("payment_started", { method });
    try {
      if (method === "cod") {
        const order = await api.placeCodOrder({ customer: form, ...cartPayload() });
        clear();
        track("purchase", { orderId: order.orderId, method: "cod", total: order.total });
        navigate(`/order-success?id=${order.orderId}&method=cod`);
        return;
      }

      await loadRazorpayScript();
      const order = await api.createRazorpayOrder({ customer: form, ...cartPayload() });

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "ProfuelX",
        description: "High Protein Chocolate",
        prefill: { name: form.name, contact: form.phone, email: form.email || undefined },
        theme: { color: "#1C130D" },
        retry: { enabled: true },
        timeout: 300,
        handler: async (response) => {
          try {
            await api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clear();
            track("purchase", { orderId: response.razorpay_order_id, method: "online", total: order.amount / 100 });
            navigate(`/order-success?id=${response.razorpay_order_id}&method=online`);
          } catch (err) {
            track("payment_failed", { reason: "verification_failed" });
            toast("Payment could not be verified. If money was deducted, it will be refunded automatically. " + err.message, true);
          }
        },
        modal: {
          ondismiss: () => { api.releaseRazorpayOrder(order.orderId).catch(() => {}); toast("Payment cancelled. Your cart has been saved."); },
        },
      });
      rzp.on("payment.failed", (resp) => {
        track("payment_failed", { reason: resp.error?.description });
        api.releaseRazorpayOrder(order.orderId).catch(() => {});
        toast("Payment failed: " + (resp.error?.description || "please try again."), true);
      });
      rzp.open();
    } catch (err) {
      toast(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap section tight">
      <div className="section-head" style={{ marginBottom: 28 }}><div className="eyebrow">Checkout</div><h2>Almost there</h2></div>

      <form className="checkout-shell" onSubmit={handleSubmit}>
        <div className="checkout-panel">
          <h3>Contact information</h3>
          <Field label="Full name" id="name" value={form.name} onChange={update} error={errors.name} errorMsg="Enter your full name." />
          <div className="field-row">
            <Field label="Phone" id="phone" value={form.phone} onChange={update} error={errors.phone} errorMsg="Enter a valid 10-digit phone number." inputMode="tel" />
            <Field label="Email (optional)" id="email" type="email" value={form.email} onChange={update} error={errors.email} errorMsg="Enter a valid email." />
          </div>

          <h3 style={{ marginTop: 24 }}>Delivery address</h3>
          <Field label="Address" id="address" as="textarea" value={form.address} onChange={update} error={errors.address} errorMsg="Enter your delivery address." />
          <div className="field-row">
            <Field label="City" id="city" value={form.city} onChange={update} error={errors.city} errorMsg="Enter your city." />
            <Field label="State" id="state" value={form.state} onChange={update} error={errors.state} errorMsg="Enter your state." />
          </div>
          <Field label="PIN code" id="pin" value={form.pin} onChange={update} error={errors.pin} errorMsg="Enter a valid 6-digit PIN code." inputMode="numeric" />

          <h3 style={{ marginTop: 24 }}>Payment</h3>
          <label className={`pay-option ${method === "online" ? "selected" : ""}`}>
            <input type="radio" name="payment" checked={method === "online"} onChange={() => setMethod("online")} />
            <div><b>Razorpay online payment</b><small>UPI, cards, net banking &amp; wallets</small></div>
          </label>
          <label className={`pay-option ${method === "cod" ? "selected" : ""}`}>
            <input type="radio" name="payment" checked={method === "cod"} onChange={() => setMethod("cod")} />
            <div><b>Cash on delivery</b><small>Pay when your order arrives</small></div>
          </label>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? <span className="spinner" /> : (method === "cod" ? "Place order →" : "Pay now →")}
          </button>
          <div className="secure-note">🛡️ Secured by Razorpay · Payments verified server-side</div>
        </div>

        <aside className="checkout-panel order-summary">
          <h3>Order summary</h3>
          {lines.map((l) => (
            <div className="order-line" key={`${l.productId}::${l.size}`}>
              <span>{l.name} ({l.sizeLabel || l.size}) × {l.qty}</span><span>{money(l.price * l.qty)}</span>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <div className="summary-row"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
            {totals.discount > 0 && <div className="summary-row discount"><span>Discount</span><span>−{money(totals.discount)}</span></div>}
            <div className="summary-row"><span>Delivery</span><span>FREE</span></div>
            <div className="summary-row total"><span>Total</span><b>{money(totals.total)}</b></div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, id, value, onChange, error, errorMsg, type = "text", as = "input", inputMode }) {
  const Tag = as;
  return (
    <div className={`field ${error ? "error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <Tag id={id} type={as === "input" ? type : undefined} inputMode={inputMode} value={value}
        onChange={(e) => onChange(id, e.target.value)} />
      <div className="field-error">{errorMsg}</div>
    </div>
  );
}
