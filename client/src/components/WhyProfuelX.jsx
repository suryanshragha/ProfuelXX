const items = [
  { num: "01", icon: "💪", title: "High Protein", body: "Designed to support active lifestyles and muscle recovery." },
  { num: "02", icon: "🌾", title: "Multigrain", body: "A nutrient-focused base designed for sustained energy." },
  { num: "03", icon: "🍫", title: "Real Chocolate Experience", body: "Rich chocolate flavour without making nutrition feel boring." },
  { num: "04", icon: "🎒", title: "Made for Real Life", body: "Perfect for workouts, commutes, travel, and everyday snacking." },
];

export default function WhyProfuelX() {
  return (
    <section id="why" className="section section--choc">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Why ProfuelX</div>
          <h2>Built for how you actually move</h2>
        </div>
        <div className="why-grid">
          {items.map((it) => (
            <div className="why-card reveal" key={it.num}>
              <div className="why-num">{it.num}</div>
              <div className="why-icon">{it.icon}</div>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
