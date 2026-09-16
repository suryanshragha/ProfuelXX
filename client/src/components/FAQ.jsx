import Accordion from "./Accordion";

const faqs = [
  { q: "How much protein is in one bite?", a: "4.5g per 15g bite (Dark Chocolate)." },
  { q: "How much protein is in the 45g bar?", a: "13.5g per bar (Dark Chocolate)." },
  { q: "What sizes are available?", a: "15g Mini Bite and 45g Chocolate Bar." },
  { q: "What flavors are available?", a: "Dark Chocolate and Classic Chocolate." },
  { q: "How should I store the chocolate?", a: "Storage guidance is being finalised — check the pack for the most current instructions in the meantime." },
  { q: "Do you offer COD?", a: "Yes, if COD is enabled for your delivery location." },
  { q: "How can I track my order?", a: "Use your Order ID on the order confirmation page to track your order's status." },
];

export default function FAQ() {
  return (
    <section id="faq" className="section section--paper">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Questions</div>
          <h2>Frequently asked</h2>
        </div>
        <div style={{ maxWidth: 720 }}>
          {faqs.map((f) => (
            <Accordion key={f.q} title={f.q} className="faq-item">
              <p>{f.a}</p>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
}
