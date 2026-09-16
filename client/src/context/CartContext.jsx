import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../api";
import { track } from "../analytics";

const CartContext = createContext(null);
// v2: v1 carts could contain a corrupted `size` field (display label instead
// of the variant key), which crashed the drawer. Bumping the key discards them.
const STORAGE_KEY = "profuelx-cart-v2";

function lineKey(productId, size) {
  return `${productId}::${size}`;
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw).lines || [] : [];
    } catch {
      return [];
    }
  });
  const [coupon, setCoupon] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").coupon || null;
    } catch {
      return null;
    }
  });
  const [totals, setTotals] = useState({ lineItems: [], subtotal: 0, discount: 0, total: 0, appliedCoupon: null });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, coupon }));
  }, [lines, coupon]);

  // Recompute authoritative totals from the server whenever the cart changes.
  useEffect(() => {
    if (!lines.length) {
      setTotals({ lineItems: [], subtotal: 0, discount: 0, total: 0, appliedCoupon: null });
      return;
    }
    api
      .previewOrder({ items: lines.map(({ productId, size, qty }) => ({ productId, size, qty })), couponCode: coupon })
      .then(setTotals)
      .catch(() => {});
  }, [lines, coupon]);

  const add = useCallback((productId, size, qty, meta) => {
    setLines((prev) => {
      const key = lineKey(productId, size);
      const existing = prev.find((l) => lineKey(l.productId, l.size) === key);
      if (existing) {
        return prev.map((l) => (lineKey(l.productId, l.size) === key ? { ...l, qty: l.qty + qty } : l));
      }
      // meta spread FIRST so it can never clobber the canonical
      // productId/size/qty fields (size must stay the variant key, e.g. "45g",
      // not a display label like "45g Chocolate Bar").
      return [...prev, { ...meta, productId, size, qty }];
    });
    track("add_to_cart", { productId, size, qty });
  }, []);

  const setQty = useCallback((productId, size, qty) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => lineKey(l.productId, l.size) !== lineKey(productId, size));
      return prev.map((l) => (lineKey(l.productId, l.size) === lineKey(productId, size) ? { ...l, qty } : l));
    });
  }, []);

  const remove = useCallback((productId, size) => {
    setLines((prev) => prev.filter((l) => lineKey(l.productId, l.size) !== lineKey(productId, size)));
    track("remove_from_cart", { productId, size });
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCoupon(null);
  }, []);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  const value = {
    lines, add, setQty, remove, clear, count, totals,
    coupon, setCoupon,
    drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function money(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}
