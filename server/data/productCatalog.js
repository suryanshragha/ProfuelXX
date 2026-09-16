/**
 * Single source of truth for products. The client fetches this via
 * GET /api/products — it never hardcodes prices or nutrition itself.
 *
 * IMPORTANT: Classic Chocolate's nutrition/ingredients were not supplied.
 * Per the project brief's own rule ("do not invent additional nutrition
 * values / ingredients"), those fields are explicitly marked as
 * placeholders rather than copied from Dark Chocolate or invented.
 *
 * Prices below are ALSO placeholders (₹XX was given in the brief, not an
 * actual number) — update them before launch.
 */

const darkChocolate = {
  id: "dark-chocolate",
  name: "Dark Chocolate",
  tagline: "High Protein Chocolate",
  description:
    "Rich dark chocolate coating over a multigrain protein base. Our original flavour.",
  accent: "#2B1B12",
  variants: {
    "15g": {
      sku: "PFX-DC-15",
      size: "15g Mini Bite",
      servingSize: "1 piece",
      price: 49,
      mrp: 59,
      stockQuantity: 500,
      nutrition: {
        energyKcal: 76,
        macros: { protein: 4.5, carbs: 6.7, fat: 3.7, fiber: 1.2 },
        micros: { magnesiumMg: 60, ironMg: 1.0, zincMg: 0.8, omega3Mg: 400 },
        fatBreakdown: { saturated: 1.2, mufa: 1.4, pufa: 1.1 },
        carbBreakdown: { naturalSugarsMin: 1.5, naturalSugarsMax: 2, complexCarbs: 4.5 },
      },
      ingredients: { provided: false, text: null },
      allergens: { provided: false, text: null },
    },
    "45g": {
      sku: "PFX-DC-45",
      size: "45g Chocolate Bar",
      servingSize: "1 full bar",
      price: 149,
      mrp: 179,
      stockQuantity: 500,
      nutrition: {
        energyKcal: 228,
        macros: { protein: 13.5, carbs: 20, fat: 11, fiber: 3.6 },
        micros: { magnesiumMg: 180, ironMg: 3, zincMg: 2.4, omega3Mg: 1200 },
        fatBreakdown: { saturated: 3.6, mufa: 4.2, pufa: 3.2 },
        carbBreakdown: { naturalSugarsMin: 5, naturalSugarsMax: 6, complexCarbs: 14 },
      },
      ingredients: { provided: false, text: null },
      allergens: { provided: false, text: null },
    },
  },
};

const classicChocolate = {
  id: "classic-chocolate",
  name: "Classic Chocolate",
  tagline: "High Protein Chocolate",
  description:
    "A milder, classic milk-chocolate take on the same multigrain protein base.",
  accent: "#6B4226",
  variants: {
    "15g": {
      sku: "PFX-CC-15",
      size: "15g Mini Bite",
      servingSize: "1 piece",
      price: 49,
      mrp: 59,
      stockQuantity: 500,
      // Classic Chocolate nutrition was not supplied in the brief — do not
      // fabricate it. UI shows this as "coming soon" rather than a number.
      nutrition: { provided: false },
      ingredients: { provided: false, text: null },
      allergens: { provided: false, text: null },
    },
    "45g": {
      sku: "PFX-CC-45",
      size: "45g Chocolate Bar",
      servingSize: "1 full bar",
      price: 149,
      mrp: 179,
      stockQuantity: 500,
      nutrition: { provided: false },
      ingredients: { provided: false, text: null },
      allergens: { provided: false, text: null },
    },
  },
};

const products = { darkChocolate, classicChocolate };

/** Flat lookup used by pricing/order logic: "dark-chocolate:45g" -> variant */
function findVariant(productId, sizeKey) {
  const product = Object.values(products).find((p) => p.id === productId);
  if (!product) return null;
  const variant = product.variants[sizeKey];
  if (!variant) return null;
  return { product, variant, sizeKey };
}

function allVariantsFlat() {
  const out = [];
  Object.values(products).forEach((product) => {
    Object.entries(product.variants).forEach(([sizeKey, variant]) => {
      out.push({ product, variant, sizeKey });
    });
  });
  return out;
}

module.exports = { products, findVariant, allVariantsFlat };
