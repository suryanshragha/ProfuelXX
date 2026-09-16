import { useState } from "react";
import { useCart, money } from "../context/CartContext";
import { useProducts } from "../context/ProductsContext";
import ChocArt from "./ChocArt";

export default function CartDrawer() {
  const { lines, setQty, remove, drawerOpen, closeDrawer, totals, coupon, setCoupon } = useCart();
  const { products } = useProducts();
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  function findProduct(productId) {
    if (!products) return null;
    return Object.values(products).find((p) => p.id === productId);
  }

  function applyCoupon() {
    if (!couponInput.trim()) return;
    setCoupon(couponInput.trim().toUpperCase());
    setCouponMsg("");
  }

  // After totals refresh, if the coupon didn't actually get applied, tell the user why.
  const couponRejected = coupon && totals.appliedCoupon !== coupon;

  return (
    <>
      <div className={`overlay-scrim ${drawerOpen ? "open" : ""}`} onClick={closeDrawer} />
      <aside className={`drawer ${drawerOpen ? "open" : ""}`} aria-label="Shopping cart">
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button onClick={closeDrawer} aria-label="Close cart">✕</button>
        </div>
        <div className="drawer-body">
          {!lines.length ? (
            <div className="drawer-empty"><div className="em">🍫</div><p>Your cart is empty.<br />Add a bar to get started.</p></div>
          ) : (
            lines.map((line) => {
              const product = findProduct(line.productId);
              if (!product) return null;
              const variant = product.variants[line.size];
              // Defensive: never let one unresolvable line take down the page.
              if (!variant) return null;
              return (
                <div className="cart-line" key={`${line.productId}::${line.size}`}>
                  <div className="cart-line-art" style={{ background: `${product.accent}22` }}>
                    <ChocArt product={product} size={line.size} />
                  </div>
                  <div className="cart-line-body">
                    <div className="cart-line-top">
                      <div>
                        <h4>{product.name}</h4>
                        <div className="variant-tag">{variant.size}</div>
                      </div>
                      <div className="cart-line-price">{money(variant.price * line.qty)}</div>
                    </div>
                    <button className="cart-line-remove" onClick={() => remove(line.productId, line.size)}>Remove</button>
                    <div className="qty-stepper" style={{ marginTop: 8 }}>
                      <button onClick={() => setQty(line.productId, line.size, line.qty - 1)} aria-label="Decrease quantity">−</button>
                      <span>{line.qty}</span>
                      <button onClick={() => setQty(line.productId, line.size, line.qty + 1)} aria-label="Increase quantity">+</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {lines.length > 0 && (
            <div style={{ marginTop: 6 }}>
              {coupon ? (
                <div className="coupon-applied">
                  <span>🏷️ {coupon} applied</span>
                  <button onClick={() => setCoupon(null)}>Remove</button>
                </div>
              ) : (
                <div className="coupon-row">
                  <input type="text" placeholder="Have a coupon?" value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)} autoComplete="off" />
                  <button className="btn btn-dark btn-sm" onClick={applyCoupon}>Apply</button>
                </div>
              )}
              {couponRejected && <div className="coupon-msg err">That code isn't valid for this order.</div>}
              {couponMsg && <div className="coupon-msg err">{couponMsg}</div>}
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="drawer-summary">
            <div className="summary-row"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
            {totals.discount > 0 && <div className="summary-row discount"><span>Discount</span><span>−{money(totals.discount)}</span></div>}
            <div className="summary-row"><span>Delivery</span><span>FREE</span></div>
            <div className="summary-row total"><span>Total</span><b>{money(totals.total)}</b></div>
            <a href="/checkout" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>Proceed to Checkout →</a>
            <button className="btn btn-ghost btn-block" onClick={closeDrawer}>Continue shopping</button>
          </div>
        )}
      </aside>
    </>
  );
}
