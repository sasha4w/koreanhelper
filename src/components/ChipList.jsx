import { useState } from "react";
import { Chevron } from "./Icon";

/**
 * Liste de chips filtrantes qui s'enroule sur plusieurs lignes au lieu de
 * défiler horizontalement. Au-delà de `max` options, un bouton « ··· »
 * révèle le reste ; l'option active reste toujours visible.
 */
export default function ChipList({ options, value, onChange, max = 6, variant }) {
  const [expanded, setExpanded] = useState(false);

  const activeIndex = options.findIndex((o) => o.value === value);
  const activeHidden = activeIndex >= max;
  const showAll = expanded || activeHidden;
  const visible = showAll ? options : options.slice(0, max);
  const hiddenCount = options.length - max;

  return (
    <div className="chip-list">
      {visible.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`chip ${variant || ""} ${opt.value === value ? "active" : ""}`}
        >
          {opt.label}
        </button>
      ))}

      {!showAll && hiddenCount > 0 && (
        <button
          type="button"
          className="chip chip-more"
          onClick={() => setExpanded(true)}
          aria-label={`Afficher ${hiddenCount} options de plus`}
        >
          +{hiddenCount}
        </button>
      )}

      {showAll && options.length > max && (
        <button
          type="button"
          className="chip chip-more"
          onClick={() => setExpanded(false)}
        >
          Réduire <Chevron className="chip-more-icon up" />
        </button>
      )}
    </div>
  );
}
