import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="logo" to="/" style={{ color: "var(--on-choc)" }}>⬡ ProfuelX</Link>
            <p style={{ fontWeight: 700, color: "var(--on-choc)", marginTop: 10 }}>Fuel Your Power</p>
            <p>Premium high-protein chocolate, crafted for athletes and anyone who wants better nutrition without compromising on taste.</p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="YouTube">▶️</a>
            </div>
          </div>
          <div className="footer-col">
            <b>Shop</b>
            <Link to="/product/dark-chocolate">Dark Chocolate</Link>
            <Link to="/product/classic-chocolate">Classic Chocolate</Link>
            <a href="/#shop">15g Mini Bites</a>
            <a href="/#shop">45g Bars</a>
          </div>
          <div className="footer-col">
            <b>Company</b>
            <a href="#">About Us</a><a href="#">Blog</a><a href="#">Careers</a><Link to="/contact">Contact</Link>
          </div>
          <div className="footer-col">
            <b>Support</b>
            <a href="/#faq">FAQ</a><a href="#">Shipping</a><a href="#">Returns</a><a href="#">Track Order</a>
          </div>
          <div className="footer-col">
            <b>Legal</b>
            <a href="#">Privacy Policy</a><a href="#">Terms &amp; Conditions</a><a href="#">Refund Policy</a><a href="#">Shipping Policy</a><a href="#">Cancellation Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ProfuelX. All rights reserved.</span>
          <span>Prices, certifications and policies shown are placeholders pending real business details.</span>
        </div>
      </div>
    </footer>
  );
}
