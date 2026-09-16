import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api";
import { money } from "../context/CartContext";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    api.getOrder(id).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  if (!id) {
    return <div className="wrap section"><div className="empty-state">No order ID given. <Link to="/">Back to shop</Link></div></div>;
  }

  return (
    <div className="wrap section">
      <div className="success-screen">
        <div className="success-mark">✅</div>
        <h2>Order Confirmed 🎉</h2>
        <p>Your ProfuelX order has been received.</p>
        <div className="order-id-chip">Order ID: {id}</div>

        {error && <p style={{ color: "var(--danger)", fontSize: 13.5 }}>{error}</p>}

        {order && (
          <div style={{ textAlign: "left", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "var(--radius-m)", padding: 22, marginBottom: 24 }}>
            {order.items.map((i, idx) => (
              <div className="order-line" key={idx}><span>{i.name} ({i.size}) × {i.qty}</span><span>{money(i.lineTotal)}</span></div>
            ))}
            <div className="summary-row total" style={{ marginTop: 8 }}><span>Total</span><b>{money(order.total)}</b></div>
            <div className="summary-row"><span>Payment method</span><span style={{ textTransform: "uppercase" }}>{order.method}</span></div>
            <div className="summary-row"><span>Payment status</span><span>{order.status}</span></div>
            <div className="summary-row"><span>Estimated delivery</span><span>2–4 business days</span></div>
          </div>
        )}

        <div className="success-actions">
          <button className="btn btn-outline" onClick={() => window.location.reload()}>Track Order</button>
          <Link to="/" className="btn btn-primary">Continue Shopping →</Link>
        </div>
      </div>
    </div>
  );
}
