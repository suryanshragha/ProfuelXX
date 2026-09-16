# ProfuelX

Full-stack rebuild: React + Vite client, Node + Express API, SQLite
persistence, and a real Razorpay Standard Checkout integration (order
creation + server-side signature verification). Product data uses a
flavor × size variant structure (Dark Chocolate / Classic Chocolate ×
15g Mini Bite / 45g Bar) with a single server-side source of truth for
pricing, nutrition, and stock.

## Honesty notes — read before you launch

This build deliberately does **not** invent things the brief said not to invent:

- **Classic Chocolate nutrition/ingredients** aren't in the brief, so they're
  marked `provided: false` in `server/data/productCatalog.js` and the UI
  shows "coming soon" instead of numbers. Fill these in once you have them.
- **Ingredients/allergens** for every variant are placeholders for the same
  reason — no ingredient list was supplied.
- **Reviews** on the homepage are labeled "Sample content — not a verified
  review." Replace with real, verified-purchase reviews before launch.
- **Contact page, footer social links, FSSAI/certifications** are all
  placeholders (`support@example.com`, `+91 XXXXX XXXXX`, `#` links). No
  certification numbers or business details are fabricated anywhere.
- **Delivery PIN checker** is explicitly a demo (`server/routes/delivery.js`)
  — it validates PIN format only, not real courier serviceability.
- **Prices** (₹49 / ₹149 etc.) are placeholders since the brief only gave
  `₹XX`. Update `server/data/productCatalog.js` before launch.

## Project structure

```
profuelx-app/
├── client/           React + Vite frontend
│   └── src/
│       ├── components/   Header, Hero, ProductSelector, NutritionSection, CartDrawer, ...
│       ├── pages/         Home, ProductDetail, Checkout, OrderSuccess, Contact
│       ├── context/       CartContext, ProductsContext, ToastContext
│       └── styles/        tokens.css, base.css, components.css, pages.css
├── server/           Express API
│   ├── data/              productCatalog.js (source of truth), coupons.js
│   ├── routes/             products.js, orders.js, delivery.js
│   ├── services/           pricing.js (authoritative totals), razorpay.js, email.js
│   ├── middleware/         errorHandler.js, rateLimit.js
│   └── db.js               SQLite schema + stock/order persistence
└── .gitignore
```

## 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 2. Environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in `server/.env` with your Razorpay **test** keys (see step 4).
`client/.env` works out of the box for local dev.

## 3. Run both apps

Two terminals:

```bash
# Terminal 1
cd server && npm run dev      # http://localhost:4000

# Terminal 2
cd client && npm run dev      # http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to the Express server (see
`client/vite.config.js`), so the frontend just calls `/api/...` regardless
of environment.

The SQLite database file (`server/profuelx.db`) is created automatically
on first run — no separate "create database" step needed.

## 4. Razorpay test mode

1. Create a Razorpay account and make sure **Test Mode** is on (top-right
   toggle in the dashboard).
2. Go to **Settings → API Keys** and generate a test key pair.
3. Put them in `server/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```
4. Restart the server so it picks up the new env vars.
5. Search Razorpay's docs for their current test card/UPI/netbanking
   credentials (these are published and change occasionally) and place a
   full test order: cart → checkout → Razorpay modal → success page.
6. Try the **Cash on Delivery** path too — it doesn't touch Razorpay at all.

### What's actually verified server-side

- `POST /api/orders/razorpay/create` recomputes the total from
  `productCatalog.js` + `coupons.js` — it never trusts a price sent by the
  browser — and reserves stock before creating the Razorpay order.
- `POST /api/orders/razorpay/verify` recomputes the HMAC-SHA256 signature
  from `order_id|payment_id` using your `RAZORPAY_KEY_SECRET` and only marks
  the order paid if it matches exactly (constant-time compare). It's
  idempotent — calling it twice for an already-paid order is a no-op.
  If the modal is dismissed or payment fails, the client calls
  `/api/orders/razorpay/release` to put the reserved stock back.

## 5. Switching to live payments

1. In the Razorpay dashboard, turn **Test Mode** off and generate **Live**
   API keys.
2. Replace `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in your **production**
   environment variables (not in this repo, not in `.env` committed
   anywhere) with the `rzp_live_...` values.
3. Re-test the full flow once in production with a small real payment
   before announcing the store is live.

## 6. Deploying

- **Frontend**: `cd client && npm run build` produces `client/dist/` —
  deploy that to Netlify/Vercel/any static host. Set `VITE_API_PROXY_TARGET`
  isn't used in production; instead configure your host to proxy `/api/*`
  to your deployed server, or set the client to call the server's full URL.
- **Backend**: deploy `server/` to Render/Railway/Fly/a VPS — anywhere that
  runs a persistent Node process (needed for the SQLite file; see below).
  Set the environment variables from `server/.env.example` in that host's
  dashboard.
- Set `FRONTEND_URL` on the server to your deployed frontend's origin (for
  CORS).

### Going to production: swapping SQLite for Postgres/MongoDB

`server/db.js` is the **only** file that touches the database directly —
every route and service calls its exported functions
(`createOrder`, `updateOrder`, `getOrder`, `decrementStockForOrder`, etc.).
To move to Postgres or MongoDB, rewrite the internals of `db.js` to use
your driver of choice (e.g. `pg` + a real `orders`/`stock` schema, or
Mongoose models) while keeping the same exported function signatures — the
rest of the app doesn't need to change.

## Next steps not built here

- **Admin dashboard**: not built (per the brief's "don't build a huge admin
  dashboard unless necessary"), but the data layer is already
  shaped for one — `productCatalog.js`, `coupons.js`, and the `orders`/
  `stock` tables are the natural CRUD surfaces.
- **Real transactional email**: `server/services/email.js` calls Resend's
  HTTP API if `EMAIL_API_KEY`/`EMAIL_FROM` are set, and just logs
  otherwise — swap the provider there if you use something else.
- **Real courier/serviceability API** for the delivery PIN checker.
- **Webhook handler**: for extra robustness, add a second Razorpay webhook
  endpoint so payments are confirmed even if a customer closes the tab
  right after paying (the current client-driven verification covers the
  normal flow).

## A note on how this was tested

This was built in an offline sandbox with no access to the npm registry,
so I could write and structurally verify the code but couldn't run
`npm install`, a live dev server, or an actual Razorpay test payment here.
What I *did* verify before handing this off:

- Every server file passes `node --check` (valid JS).
- The pricing/coupon/variant-lookup logic was executed directly with test
  cases (mixed variants stay separate, invalid sizes/quantities are
  rejected, coupon minimums are enforced) — all correct.
- The HMAC-SHA256 signature logic was verified to produce a well-formed
  signature.
- Every client file was parsed with esbuild (same parser Vite uses) with
  zero errors, and the **entire client app was bundled end-to-end** —
  every import between every component/page/context file resolves
  correctly and all JSX is well-formed.

Run it locally per the steps above before deploying — that's the one thing
I couldn't do for you from here.
