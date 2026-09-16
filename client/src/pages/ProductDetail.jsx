import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { useCart, money } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { track } from "../analytics";
import ChocArt from "../components/ChocArt";
import Accordion from "../components/Accordion";
import DeliveryPinChecker from "../components/DeliveryPinChecker";

const GALLERY_VIEWS = ["Front", "Close-up", "Broken piece", "Ingredients"];

export default function ProductDetail() {
  const { productId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading } = useProducts();
  const { add, openDrawer } = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const product = products ? Object.values(products).find((p) => p.id === productId) : null;
  const size = searchParams.get("size") && product?.variants?.[searchParams.get("size")]
    ? searchParams.get("size")
    : "45g";
  const variant = product?.variants?.[size];

  useEffect(() => {
    if (product) track("product_view", { productId: product.id, size });
  }, [product, size]);

  if (loading) return <div className="wrap section"><p>Loading…</p></div>;
  if (!product) {
    return (
      <div className="wrap section">
        <div className="empty-state">Product not found. <Link to="/">Back to shop</Link></div>
      </div>
    );
  }

  function selectSize(newSize) {
    setSearchParams({ size: newSize });
    setGalleryIdx(0);
    track("size_selected", { productId: product.id, size: newSize });
  }

  function handleAdd(buyNow) {
    if (variant.inStock === false) { toast("This size is currently out of stock.", true); return; }
    add(product.id, size, qty, { name: product.name, sizeLabel: variant.size, price: variant.price, accent: product.accent });
    if (buyNow) { window.location.href = "/checkout"; return; }
    setAdded(true);
    toast("Added to cart ✓");
    openDrawer();
    setTimeout(() => setAdded(false), 1400);
  }

  const otherFlavor = Object.values(products).find((p) => p.id !== product.id);

  return (
    <div className="wrap section">
      <div className="breadcrumb"><Link to="/">Home</Link> / <a href="/#shop">Shop</a> / <span>{product.name}</span></div>

      <div className="pd-shell" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div>
          <div className="pd-showcase-art" style={{ background: `${product.accent}18`, aspectRatio: "1/1" }}>
            <ChocArt product={product} size={size} />
          </div>
          <div className="pd-gallery">
            {GALLERY_VIEWS.map((label, i) => (
              <button key={label} type="button" className={`pd-gallery-thumb ${galleryIdx === i ? "active" : ""}`}
                onClick={() => setGalleryIdx(i)} title={`${label} (illustration)`}>
                {["🍫", "🔍", "💥", "🌾"][i]}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 8 }}>
            Illustrative artwork — replace with real product photography before launch.
          </p>
        </div>

        <div>
          <div className="pc-tagline">{product.tagline}</div>
          <h1 style={{ fontSize: "clamp(26px,4vw,38px)", marginTop: 6 }}>{product.name}</h1>
          <p style={{ marginTop: 12, color: "var(--text-soft)", fontSize: 15, lineHeight: 1.6 }}>{product.description}</p>

          <div className="selector-block" style={{ marginTop: 22 }}>
            <span className="selector-label">Size</span>
            <div className="pill-row">
              {Object.entries(product.variants).map(([sizeKey, v]) => (
                <button key={sizeKey} type="button" className="pill-btn" aria-pressed={size === sizeKey}
                  disabled={v.inStock === false} onClick={() => selectSize(sizeKey)}>
                  {v.size}{v.inStock === false ? " · Out of stock" : ""}
                </button>
              ))}
            </div>
          </div>

          {variant.nutrition?.provided === false ? (
            <p className="placeholder-note">Nutrition details for this flavour are coming soon.</p>
          ) : (
            <div className="stat-pill-row">
              <div className="stat-pill"><strong>{variant.nutrition.macros.protein}g</strong><span>Protein</span></div>
              <div className="stat-pill"><strong>{variant.nutrition.energyKcal}</strong><span>Calories</span></div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "16px 0" }}>
            <strong style={{ fontFamily: "var(--display)", fontSize: 28 }}>{money(variant.price)}</strong>
            <span style={{ color: "var(--text-soft)", fontSize: 14, textDecoration: "line-through" }}>{money(variant.mrp)}</span>
            {variant.inStock === false && <span className="out-of-stock-badge">Out of Stock</span>}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div className="qty-stepper">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
            </div>
            <button type="button" className={`btn btn-dark add-cart-btn ${added ? "added" : ""}`} disabled={variant.inStock === false} onClick={() => handleAdd(false)}>
              {added ? "✓ Added" : "Add to Cart"}
            </button>
            <button type="button" className="btn btn-primary" disabled={variant.inStock === false} onClick={() => handleAdd(true)}>
              Buy Now →
            </button>
          </div>

          <DeliveryPinChecker />

          <Accordion title="Ingredients" defaultOpen>
            {variant.ingredients?.provided ? <p>{variant.ingredients.text}</p> : <p className="placeholder-note">Ingredient list to be published — check back soon.</p>}
          </Accordion>
          <Accordion title="Allergen information">
            {variant.allergens?.provided ? <p>Contains: {variant.allergens.text}</p> : <p className="placeholder-note">Allergen information to be published — check back soon.</p>}
          </Accordion>
          <Accordion title="FAQ">
            <p>See the full FAQ on the <Link to="/#faq">homepage</Link>.</p>
          </Accordion>
        </div>
      </div>

      {otherFlavor && (
        <div style={{ marginTop: 64 }}>
          <div className="section-head" style={{ marginBottom: 24 }}>
            <div className="eyebrow">You might also like</div>
            <h2 style={{ fontSize: 24 }}>Try the other flavour</h2>
          </div>
          <div className="product-grid" style={{ gridTemplateColumns: "repeat(2,1fr)", maxWidth: 500 }}>
            <Link to={`/product/${otherFlavor.id}`} className="product-card">
              <div className="pc-art" style={{ background: `${otherFlavor.accent}18` }}><ChocArt product={otherFlavor} size="45g" /></div>
              <h3>{otherFlavor.name}</h3>
              <p className="pc-desc">{otherFlavor.description}</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
