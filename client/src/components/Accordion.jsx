import { useState } from "react";

export default function Accordion({ title, children, defaultOpen = false, className = "" }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`accordion-item ${open ? "open" : ""} ${className}`}>
      <button type="button" className="accordion-q" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {title}
        <span className="chev">▾</span>
      </button>
      <div className="accordion-a"><div className="accordion-a-inner">{children}</div></div>
    </div>
  );
}
