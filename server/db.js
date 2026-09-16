/**
 * Minimal persistence layer using SQLite (better-sqlite3) so the project
 * runs with zero external services. The rest of the app only calls the
 * functions exported here, so migrating to Postgres or MongoDB later means
 * rewriting this one file, not the routes/services that use it.
 */
const Database = require("better-sqlite3");
const path = require("path");
const { allVariantsFlat } = require("../data/productCatalog");

const db = new Database(path.join(__dirname, "..", "profuelx.db"));
db.pragma("journal_mode = WAL");

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stock (
      sku TEXT PRIMARY KEY,
      quantity INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      method TEXT NOT NULL,
      customer_json TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      discount INTEGER NOT NULL,
      total INTEGER NOT NULL,
      coupon_code TEXT,
      razorpay_payment_id TEXT,
      created_at TEXT NOT NULL,
      paid_at TEXT
    );
  `);

  // Seed stock rows for every variant that doesn't have one yet.
  const insertIfMissing = db.prepare(
    `INSERT OR IGNORE INTO stock (sku, quantity) VALUES (?, ?)`
  );
  allVariantsFlat().forEach(({ variant }) => {
    insertIfMissing.run(variant.sku, variant.stockQuantity);
  });
}

function getStock(sku) {
  const row = db.prepare(`SELECT quantity FROM stock WHERE sku = ?`).get(sku);
  return row ? row.quantity : 0;
}

/** Throws if any line item doesn't have enough stock. Applies all-or-nothing. */
function decrementStockForOrder(lineItems) {
  const tx = db.transaction((items) => {
    for (const item of items) {
      const current = getStock(item.sku);
      if (current < item.qty) {
        throw new Error(`${item.name} (${item.size}) is out of stock.`);
      }
    }
    const update = db.prepare(`UPDATE stock SET quantity = quantity - ? WHERE sku = ?`);
    for (const item of items) update.run(item.qty, item.sku);
  });
  tx(lineItems);
}

function restoreStockForOrder(lineItems) {
  const update = db.prepare(`UPDATE stock SET quantity = quantity + ? WHERE sku = ?`);
  const tx = db.transaction((items) => { for (const item of items) update.run(item.qty, item.sku); });
  tx(lineItems);
}

function createOrder(order) {
  db.prepare(`
    INSERT INTO orders (id, status, method, customer_json, items_json, subtotal, discount, total, coupon_code, created_at)
    VALUES (@id, @status, @method, @customer_json, @items_json, @subtotal, @discount, @total, @coupon_code, @created_at)
  `).run(order);
}

function updateOrder(id, patch) {
  const existing = getOrder(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  db.prepare(`
    UPDATE orders SET status=@status, razorpay_payment_id=@razorpay_payment_id, paid_at=@paid_at WHERE id=@id
  `).run({
    id,
    status: merged.status,
    razorpay_payment_id: merged.razorpay_payment_id || null,
    paid_at: merged.paid_at || null,
  });
  return getOrder(id);
}

function getOrder(id) {
  const row = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id);
  if (!row) return null;
  return {
    ...row,
    customer: JSON.parse(row.customer_json),
    items: JSON.parse(row.items_json),
  };
}

module.exports = {
  initDb,
  getStock,
  decrementStockForOrder,
  restoreStockForOrder,
  createOrder,
  updateOrder,
  getOrder,
};
