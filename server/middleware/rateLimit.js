/**
 * In-memory fixed-window rate limiter. Fine for a single Node instance;
 * swap for a Redis-backed limiter (e.g. rate-limiter-flexible) once you're
 * running more than one server process.
 */
function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const entry = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count += 1;
    hits.set(key, entry);

    if (entry.count > max) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
    }
    next();
  };
}

module.exports = { rateLimit };
