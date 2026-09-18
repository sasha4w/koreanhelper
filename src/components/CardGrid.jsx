import "./CardGrid.css";

/**
 * Grille de cartes cliquables (thèmes, chapitres, sections de leçons…).
 * Remplace l'ancienne pile d'accordéons empilés verticalement — profite
 * de la largeur disponible au lieu de gaspiller l'espace latéral.
 */
export default function CardGrid({ items, onSelect }) {
  return (
    <div className="card-grid">
      {items.map((item, index) => (
        <button
          key={item.key}
          type="button"
          className="grid-card"
          style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
          onClick={() => onSelect(item.key)}
        >
          <span className="grid-card-title">{item.title}</span>
          <span className="grid-card-count">{item.countLabel}</span>
        </button>
      ))}
    </div>
  );
}
