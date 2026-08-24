import { useState } from "react";
import "./Section.css";

export default function Section({ title, count, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="accordion-section">
      <button
        type="button"
        className={`accordion-header ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <span className="accordion-title">{title}</span>
        <span className="accordion-right">
          {count != null && <span className="accordion-count">{count}</span>}
          <span className="accordion-chevron" aria-hidden="true">
            {isOpen ? "▲" : "▼"}
          </span>
        </span>
      </button>

      <div className={`accordion-body ${isOpen ? "open" : ""}`}>
        <div className="accordion-body-inner">
          <div className="grid">{children}</div>
        </div>
      </div>
    </div>
  );
}
