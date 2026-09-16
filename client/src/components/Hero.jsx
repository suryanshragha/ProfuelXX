import AnimatedNumber from "./AnimatedNumber";

export default function Hero() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero">
          <div className="hero-copy">
            <h1>High Protein<br />Chocolate<br />Made To Fuel You</h1>
            <p className="sub">Healthy. Tasty. Powerful.</p>
            <p className="support">
              Crafted for athletes, fitness enthusiasts, and anyone who wants better nutrition
              without compromising on taste.
            </p>
            <div className="hero-actions">
              <a href="#shop" className="btn btn-primary">Shop Chocolate →</a>
              <a href="#nutrition" className="btn btn-outline">Explore Nutrition</a>
            </div>
            <div className="hero-stats">
              <div><AnimatedNumber value={4.5} decimals={1} /><span>g Protein / Bite</span></div>
              <div><AnimatedNumber value={13.5} decimals={1} /><span>g Protein / Bar</span></div>
              <div><AnimatedNumber value={3.6} decimals={1} /><span>g Fiber / Bar</span></div>
              <div><AnimatedNumber value={228} decimals={0} /><span>Calories / Bar</span></div>
            </div>
          </div>

          <div className="choc-stage" aria-hidden="true">
            <span className="choc-float-icon" style={{ top: "8%", left: "10%" }}>🍫</span>
            <span className="choc-float-icon" style={{ top: "70%", right: "8%", animationDelay: ".8s" }}>🌾</span>
            <span className="choc-float-icon" style={{ top: "20%", right: "4%", animationDelay: "1.6s" }}>⚡</span>
            <svg className="choc-bar" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="heroChocGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5B3A22" />
                  <stop offset="100%" stopColor="#1C130D" />
                </linearGradient>
              </defs>
              <ellipse cx="150" cy="230" rx="110" ry="18" fill="rgba(0,0,0,.18)" />
              <rect x="55" y="90" width="190" height="100" rx="20" fill="url(#heroChocGrad)" />
              <rect x="55" y="90" width="190" height="100" rx="20" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="2" />
              {[1, 2, 3].map((i) => (
                <line key={i} x1={55 + i * 47.5} y1="94" x2={55 + i * 47.5} y2="186" stroke="rgba(0,0,0,.3)" strokeWidth="2" />
              ))}
              <rect className="choc-shine" x="70" y="98" width="40" height="84" rx="10" fill="rgba(255,255,255,.35)" />
              <circle className="choc-crumb crumb-1" cx="60" cy="205" r="4" fill="#3E2818" />
              <circle className="choc-crumb crumb-2" cx="230" cy="200" r="5" fill="#3E2818" />
              <circle className="choc-crumb crumb-3" cx="150" cy="215" r="3.5" fill="#3E2818" />
            </svg>
          </div>
        </div>
      </section>

      <div className="feature-strip">
        <div className="wrap">
          <div className="feature-item">🍫 <span>Real chocolate</span></div>
          <div className="feature-item">🌾 <span><b>Multigrain</b> base</span></div>
          <div className="feature-item">💪 <span><b>13.5g</b> protein / bar</span></div>
          <div className="feature-item">⚡ <span>Sustained energy</span></div>
        </div>
      </div>
    </>
  );
}
