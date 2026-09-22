import { useEffect, useState } from "react";
import "./MasteryBar.css";

const TIERS = [
  { key: "new", label: "Nouveau" },
  { key: "learning", label: "En cours" },
  { key: "almost", label: "Presque acquis" },
  { key: "mastered", label: "Maîtrisé" },
];

/**
 * Barre de répartition globale : combien de mots sont à chaque niveau de
 * maîtrise (voir lib/mastery.js), sur l'ensemble actuellement filtré.
 */
export default function MasteryBar({ counts }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const total = TIERS.reduce((sum, t) => sum + (counts[t.key] || 0), 0);
  if (total === 0) return null;

  return (
    <div className="mastery-bar-wrap">
      <div className="mastery-bar" role="img" aria-label="Répartition des mots par niveau de maîtrise">
        {TIERS.map((t) => {
          const count = counts[t.key] || 0;
          const pct = (count / total) * 100;
          if (count === 0) return null;
          return (
            <div
              key={t.key}
              className={`mastery-bar-segment mastery-${t.key}`}
              style={{ width: mounted ? `${pct}%` : "0%" }}
              title={`${t.label} : ${count}`}
            />
          );
        })}
      </div>
      <div className="mastery-bar-legend">
        {TIERS.map((t) => (
          <span key={t.key} className="mastery-bar-legend-item">
            <span className={`mastery-bar-dot mastery-${t.key}`} />
            {t.label} <strong>{counts[t.key] || 0}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
