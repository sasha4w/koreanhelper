import { useState } from "react";
import "./Card.css";

export default function Card({
  title,
  tag,
  tagColor,
  formula,
  formulaColor,
  desc,
  examples,
  note,
  noteType,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const hasMore = Boolean(examples?.length || note);

  const header = (
    <div className="card-header-left">
      <h2>{title}</h2>
      {tag && <span className={`tag ${tagColor || ""}`}>{tag}</span>}
    </div>
  );

  return (
    <div className={`card ${isOpen ? "card-open" : ""}`}>
      {hasMore ? (
        <button
          type="button"
          className="card-header"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
        >
          {header}
          <span className="card-chevron" aria-hidden="true">
            {isOpen ? "▲" : "▼"}
          </span>
        </button>
      ) : (
        <div className="card-header">{header}</div>
      )}

      {formula && (
        <div className={`formula ${formulaColor || ""}`}>{formula}</div>
      )}

      {desc && <p className="desc">{desc}</p>}

      {hasMore && (
        <div className={`card-body ${isOpen ? "open" : ""}`}>
          <div className="card-body-inner">
            {examples?.length > 0 && (
              <div className="examples">
                {examples.map((ex, i) => (
                  <p key={i}>
                    <span className="kor">{ex.kor}</span> —{" "}
                    <span className="fr">{ex.fr}</span>
                  </p>
                ))}
              </div>
            )}

            {note && <div className={`note ${noteType || ""}`}>{note}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
