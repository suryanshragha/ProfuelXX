import { useMemo, useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { useCart, money } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import ChocArt from "./ChocArt";

export default function ProductSelector() {
  const { products, loading } = useProducts();
  const { add, openDrawer } = useCart();
  const toast = useToast();
  const [flavorKey, setFlavorKey] = useState("darkChocolate");
  const [size, setSize] = useState("45g");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products?.[flavorKey];
  const variant = product?.variants?.[size];

  const flavorEntries = useMemo(() => (products ? Object.entries(products) : []), [products]);

  if (loading) return <p style={{ color: "var(--text-soft)" }}>Loading products…</p>;
  if (!product || !variant) return null;

  function handleAdd() {
    if (!variant.inStock && variant.inStock !== undefined) {
      toast("That size is currently out of stock.", true);
      return;
    }
    add(product.id, size, qty, { name: product.name, sizeLabel: variant.size, price: variant.price, accent: product.accent });
    setAdded(true);
    toast("Added to cart ✓");
    openDrawer();
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="pd-showcase" key={`${flavorKey}-${size}`}>
      <div className="pd-showcase-art" style={{ background: `${product.accent}18` }}>
        <ChocArt product={product} size={size} />
      </div>
      <div>
        <div className="selector-block">
          <span className="selector-label">Choose Chocolate</span>
          <div className="pill-row">
            {flavorEntries.map(([key, p]) => (
              <button key={key} type="button" className="pill-btn" aria-pressed={flavorKey === key}
                onClick={() => setFlavorKey(key)}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div className="selector-block">
          <span className="selector-label">Choose Size</span>
          <div className="pill-row">
            {Object.entries(product.variants).map(([sizeKey, v]) => (
              <button key={sizeKey} type="button" className="pill-btn" aria-pressed={size === sizeKey}
                disabled={v.inStock === false} onClick={() => setSize(sizeKey)}>
                {v.size}{v.inStock === false ? " · Out of stock" : ""}
              </button>
            ))}
          </div>
        </div>

        <h3 style={{ fontSize: 24 }}>{product.name}</h3>
        <p style={{ color: "var(--text-soft)", fontSize: 14.5, marginTop: 6 }}>{product.description}</p>

        {variant.nutrition?.provided === false ? (
          <p className="placeholder-note" style={{ marginTop: 16 }}>Nutrition details for this flavour are coming soon.</p>
        ) : (
          <div className="stat-pill-row">
            <div className="stat-pill"><strong>{variant.nutrition.macros.protein}g</strong><span>Protein</span></div>
            <div className="stat-pill"><strong>{variant.nutrition.energyKcal}</strong><span>Calories</span></div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "18px 0" }}>
          <strong style={{ fontFamily: "var(--display)", fontSize: 26 }}>{money(variant.price)}</strong>
          <span style={{ color: "var(--text-soft)", fontSize: 14, textDecoration: "line-through" }}>{money(variant.mrp)}</span>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div className="qty-stepper">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
          </div>
          <button type="button" className={`btn btn-primary add-cart-btn ${added ? "added" : ""}`} onClick={handleAdd} disabled={variant.inStock === false}>
            {added ? "✓ Added" : "Add to Cart"}
          </button>
          <a href={`/product/${product.id}?size=${size}`} className="btn btn-outline">View details</a>
        </div>
      </div>
    </div>
  );
}
