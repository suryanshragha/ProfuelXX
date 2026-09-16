import { useState } from "react";

export default function WhatsAppButton() {
  const [showTip, setShowTip] = useState(false);
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || "91XXXXXXXXXX";

  return (
    <>
      <a
        className="whatsapp-fab"
        href={`https://wa.me/${number}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        💬
      </a>
      <span className={`whatsapp-tip ${showTip ? "show" : ""}`}>Need help? Chat with us</span>
    </>
  );
}
