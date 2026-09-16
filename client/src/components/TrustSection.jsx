const items = [
  { icon: "🔒", label: "Secure Payments" },
  { icon: "🚚", label: "Fast Delivery" },
  { icon: "↩️", label: "Easy Returns" },
  { icon: "💬", label: "Customer Support" },
  { icon: "🛡️", label: "Secure Checkout" },
  { icon: "🌿", label: "Quality Ingredients" },
];

export default function TrustSection() {
  return (
    <section className="section tight section--paper">
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: 28 }}>
          <div className="eyebrow">Why shop with ProfuelX</div>
        </div>
        <div className="trust-band">
          {items.map((it) => (
            <div className="trust-item" key={it.label}><span>{it.icon}</span>{it.label}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
