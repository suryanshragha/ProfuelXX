import { useEffect } from "react";
import Hero from "../components/Hero";
import ProductSelector from "../components/ProductSelector";
import NutritionSection from "../components/NutritionSection";
import WhyProfuelX from "../components/WhyProfuelX";
import IngredientStory from "../components/IngredientStory";
import HowToEnjoy from "../components/HowToEnjoy";
import TrustSection from "../components/TrustSection";
import Reviews from "../components/Reviews";
import FAQ from "../components/FAQ";
import { track } from "../analytics";

export default function Home() {
  useEffect(() => {
    track("page_view", { page: "home" });
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Hero />
      <section id="shop" className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Our range</div>
            <h2>Pick your power</h2>
            <p>Choose your chocolate. Choose your size. Fuel your day.</p>
          </div>
          <ProductSelector />
        </div>
      </section>
      <NutritionSection />
      <WhyProfuelX />
      <IngredientStory />
      <HowToEnjoy />
      <TrustSection />
      <Reviews />
      <FAQ />
    </>
  );
}
