import { useState } from "react";

export default function Section({ title, children, defaultOpen = false }) {
  // Changé à false ici
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="accordion-section">
      <button
        className={`accordion-header ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <span className="accordion-title">{title}</span>
        <span className="accordion-chevron">{isOpen ? "▲" : "▼"}</span>
      </button>

      <div className={`accordion-body ${isOpen ? "open" : ""}`}>
        <div className="grid">{children}</div>
      </div>
    </div>
  );
}
