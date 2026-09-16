import { useState } from "react";
import { useProducts } from "../context/ProductsContext";
import Accordion from "./Accordion";

export default function NutritionSection() {
  const { products, loading } = useProducts();
  const [flavorKey, setFlavorKey] = useState("darkChocolate");
  const [size, setSize] = useState("45g");

  if (loading || !products) return null;
  const product = products[flavorKey];
  const variant = product.variants[size];
  const n = variant.nutrition;

  return (
    <section id="nutrition" className="section section--paper">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Nutrition &amp; ingredients</div>
          <h2>Know exactly what fuels you.</h2>
        </div>

        <div className="selector-block">
          <span className="selector-label">Chocolate</span>
          <div className="pill-row">
            {Object.entries(products).map(([key, p]) => (
              <button key={key} type="button" className="pill-btn" aria-pressed={flavorKey === key} onClick={() => setFlavorKey(key)}>{p.name}</button>
            ))}
          </div>
        </div>
        <div className="selector-block">
          <span className="selector-label">Serving size</span>
          <div className="pill-row">
            {Object.entries(product.variants).map(([sizeKey, v]) => (
              <button key={sizeKey} type="button" className="pill-btn" aria-pressed={size === sizeKey} onClick={() => setSize(sizeKey)}>{v.size}</button>
            ))}
          </div>
        </div>

        {n?.provided === false ? (
          <div className="placeholder-note">
            Nutrition information for {product.name} is being finalised and will be published here shortly.
          </div>
        ) : (
          <div className="nutri-shell">
            <div className="nutri-card">
              <span className="badge">{variant.servingSize} · {variant.size}</span>
              <div className="nutri-energy"><strong>{n.energyKcal}</strong><span>kcal</span></div>
              <p className="nutrition-claim">4.5g Protein per Bite | 13.5g Protein per Bar</p>
              <div className="macro-row">
                <div><strong>{n.macros.protein}g</strong><span>Protein</span></div>
                <div><strong>{n.macros.carbs}g</strong><span>Carbs</span></div>
                <div><strong>{n.macros.fat}g</strong><span>Fat</span></div>
                <div><strong>{n.macros.fiber}g</strong><span>Fiber</span></div>
              </div>
              <p className="nutrition-disclaimer">Values are approximate and may vary slightly based on ingredient sourcing and processing.</p>
            </div>

            <div className="nutri-accordion">
              <Accordion title="Micronutrients" defaultOpen>
                <div className="micro-grid">
                  <div className="micro-item"><b>{n.micros.magnesiumMg}mg</b><span>Magnesium</span></div>
                  <div className="micro-item"><b>{n.micros.ironMg}mg</b><span>Iron</span></div>
                  <div className="micro-item"><b>{n.micros.zincMg}mg</b><span>Zinc</span></div>
                  <div className="micro-item"><b>{n.micros.omega3Mg}mg</b><span>Omega-3</span></div>
                </div>
              </Accordion>
              <Accordion title="Fat breakdown">
                <div className="breakdown-row"><span>Saturated fat</span><span>{n.fatBreakdown.saturated}g</span></div>
                <div className="breakdown-row"><span>Monounsaturated (MUFA)</span><span>{n.fatBreakdown.mufa}g</span></div>
                <div className="breakdown-row"><span>Polyunsaturated (PUFA)</span><span>{n.fatBreakdown.pufa}g</span></div>
              </Accordion>
              <Accordion title="Carbohydrate breakdown">
                <div className="breakdown-row"><span>Natural sugars</span><span>{n.carbBreakdown.naturalSugarsMin}–{n.carbBreakdown.naturalSugarsMax}g</span></div>
                <div className="breakdown-row"><span>Complex carbohydrates</span><span>{n.carbBreakdown.complexCarbs}g</span></div>
              </Accordion>
              <Accordion title="Ingredients">
                {variant.ingredients?.provided ? <p>{variant.ingredients.text}</p> : <p className="placeholder-note">Ingredient list to be published — check back soon.</p>}
              </Accordion>
              <Accordion title="Allergen information">
                {variant.allergens?.provided ? <p>Contains: {variant.allergens.text}</p> : <p className="placeholder-note">Allergen information to be published — check back soon.</p>}
              </Accordion>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
