const confirmed = [
  { em: "🍫", label: "Chocolate", note: "Real chocolate coating, not a compound flavour" },
  { em: "🌾", label: "Multigrain base", note: "A nutrient-focused grain foundation" },
  { em: "💪", label: "Protein", note: "The source behind every gram on the label" },
];

export default function IngredientStory() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">What's inside</div>
          <h2>What's inside your bar?</h2>
        </div>
        <div className="ingredient-grid">
          {confirmed.map((it) => (
            <div className="ingredient-chip reveal" key={it.label}>
              <div className="em">{it.em}</div>
              <b>{it.label}</b>
              <span>{it.note}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: "var(--text-soft)" }}>
          Full ingredient list and allergen information for each flavour and size is in the
          Nutrition &amp; Ingredients section above.
        </p>
      </div>
    </section>
  );
}
