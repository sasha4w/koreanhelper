import { useState } from "react";

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

  const hasMore = examples || note;

  return (
    <div className={`card ${isOpen ? "card-open" : ""}`}>
      <div
        className="card-header"
        onClick={() => hasMore && setIsOpen((v) => !v)}
        style={{ cursor: hasMore ? "pointer" : "default" }}
      >
        <div className="card-header-left">
          <h2>{title}</h2>
          {tag && <span className={`tag ${tagColor || ""}`}>{tag}</span>}
        </div>
        {hasMore && <span className="card-chevron">{isOpen ? "▲" : "▼"}</span>}
      </div>

      {formula && (
        <div className={`formula ${formulaColor || ""}`}>{formula}</div>
      )}

      {desc && <p className="desc">{desc}</p>}

      <div className={`card-body ${isOpen ? "open" : ""}`}>
        {examples && (
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
  );
}
