require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const db = require("./db");
const { errorHandler } = require("./middleware/errorHandler");
const { rateLimit } = require("./middleware/rateLimit");
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const deliveryRouter = require("./routes/delivery");

db.initDb();

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/products", productsRouter);
app.use("/api/delivery", deliveryRouter);
// Order-creation/verification endpoints are the sensitive ones — rate-limited.
app.use("/api/orders", rateLimit({ windowMs: 60_000, max: 30 }), ordersRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`ProfuelX API listening on http://localhost:${PORT}`));
