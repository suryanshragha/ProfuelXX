import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openDrawer } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap nav-row">
        <Link className="logo" to="/">
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
            <polygon points="16,2 29,9 29,23 16,30 3,23 3,9" fill="#1C130D" />
            <polygon points="16,7 24,11.5 24,20.5 16,25 8,20.5 8,11.5" fill="#B7E514" />
          </svg>
          ProfuelX
        </Link>
        <nav className={`nav-links ${menuOpen ? "show" : ""}`}>
          <a href="/#shop" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="/#nutrition" onClick={() => setMenuOpen(false)}>Nutrition</a>
          <a href="/#why" onClick={() => setMenuOpen(false)}>Why ProfuelX</a>
          <a href="/#reviews" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a href="/#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" aria-label="Search" title="Search (demo)">🔍</button>
          <button className="icon-btn" aria-label="Account" title="Account (demo)">👤</button>
          <button className="icon-btn cart-btn" aria-label={`Cart, ${count} items`} onClick={openDrawer}>
            🛒{count > 0 && <span className="cart-count">{count}</span>}
          </button>
          <button className="nav-toggle" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>☰</button>
        </div>
      </div>
    </header>
  );
}
