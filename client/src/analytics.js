/**
 * Fires the events listed in the brief (page_view, add_to_cart, etc.).
 * With no VITE_ANALYTICS_ENDPOINT set, this just logs to the console —
 * point it at GA4/Segment/PostHog/your own endpoint via env vars.
 */
export function track(eventName, payload = {}) {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  const event = { event: eventName, ...payload, ts: Date.now() };

  if (!endpoint) {
    console.debug("[analytics]", event);
    return;
  }
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {});
}
