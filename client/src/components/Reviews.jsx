const sampleReviews = [
  { text: "The chocolate taste is genuinely good, and I don't feel like I'm eating a supplement. Works well as a post-workout snack.", name: "Sample reviewer", product: "Dark Chocolate · 45g Bar" },
  { text: "Convenient size for keeping in my bag. The mini bites are a nice quick option between meetings.", name: "Sample reviewer", product: "Classic Chocolate · 15g Mini Bite" },
  { text: "Ordered a few bars to try before training. Held up well as an on-the-go option.", name: "Sample reviewer", product: "Dark Chocolate · 15g Mini Bite" },
];

export default function Reviews() {
  return (
    <section id="reviews" className="section">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Reviews</div>
          <h2>What people are saying</h2>
        </div>
      </div>
      <div className="testi-track">
        {sampleReviews.map((r, i) => (
          <div className="testi-card" key={i}>
            <span className="sample-tag">Sample content — not a verified review</span>
            <div className="testi-stars">★★★★★</div>
            <p>"{r.text}"</p>
            <div className="testi-person">
              <b>{r.name}</b>
              <span>{r.product}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
