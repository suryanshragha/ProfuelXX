import { useState } from "react";
import { api } from "../api";

export default function DeliveryPinChecker() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function check(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.checkDelivery(pin);
      setResult(res);
    } catch (err) {
      setResult({ ok: false, message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pin-checker">
      <span className="selector-label">📍 Check delivery</span>
      <form className="pin-row" onSubmit={check}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Enter PIN code"
          value={pin}
          maxLength={6}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        />
        <button type="submit" className="btn btn-dark btn-sm" disabled={loading}>{loading ? "…" : "Check"}</button>
      </form>
      {result && (
        <div className={`pin-result ${result.ok ? "ok" : "bad"}`}>
          {result.ok ? (
            <>✓ {result.message}. Estimated delivery: <b>{result.etaDays}</b>{result.demo && " (demo estimate)"}</>
          ) : (
            result.message
          )}
        </div>
      )}
    </div>
  );
}
