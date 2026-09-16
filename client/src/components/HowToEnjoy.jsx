const items = [
  { em: "🏋️", title: "Pre-Workout", body: "Quick fuel before training." },
  { em: "🔋", title: "Post-Workout", body: "Convenient protein after training." },
  { em: "🎒", title: "On-The-Go", body: "A compact snack for busy days." },
];

export default function HowToEnjoy() {
  return (
    <section className="section section--paper">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">How to enjoy it</div>
          <h2>Fits into your day, not the other way around</h2>
        </div>
        <div className="enjoy-grid">
          {items.map((it) => (
            <div className="enjoy-card reveal" key={it.title}>
              <div className="em">{it.em}</div>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
