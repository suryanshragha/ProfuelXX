const { getStore } = require("@netlify/blobs");
const { allVariantsFlat } = require("./_catalog");

function stockStore() { return getStore("stock"); }
function ordersStore() { return getStore("orders"); }

const defaults = {};
allVariantsFlat().forEach(({ variant }) => { defaults[variant.sku] = variant.stockQuantity; });

async function getStock(sku) {
  try {
    const v = await stockStore().get(sku, { type: "json" });
    return v == null ? defaults[sku] ?? 0 : v.quantity;
  } catch {
    return defaults[sku] ?? 0;
  }
}

async function setStock(sku, quantity) {
  await stockStore().setJSON(sku, { quantity });
}

/**
 * NOTE: Netlify Blobs has no multi-key transactions, so this is best-effort
 * read-modify-write, not atomic. Fine for a low/moderate-traffic storefront;
 * for high concurrency, move stock tracking to a real database (see README).
 */
async function decrementStockForOrder(lineItems) {
  for (const item of lineItems) {
    const current = await getStock(item.sku);
    if (current < item.qty) throw new Error(`${item.name} (${item.size}) is out of stock.`);
  }
  for (const item of lineItems) {
    const current = await getStock(item.sku);
    await setStock(item.sku, current - item.qty);
  }
}

async function restoreStockForOrder(lineItems) {
  for (const item of lineItems) {
    const current = await getStock(item.sku);
    await setStock(item.sku, current + item.qty);
  }
}

async function saveOrder(id, record) {
  await ordersStore().setJSON(id, record);
}

async function getOrder(id) {
  try {
    return await ordersStore().get(id, { type: "json" });
  } catch {
    return null;
  }
}

module.exports = { getStock, decrementStockForOrder, restoreStockForOrder, saveOrder, getOrder };
