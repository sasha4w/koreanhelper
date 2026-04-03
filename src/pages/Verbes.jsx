import { useState } from "react";
import Section from "../components/Section";
import Card from "../components/Card";
import { verbesSections } from "../data/verbesData";

export default function Verbes() {
  const [levelFilter, setLevelFilter] = useState("all");

  // Logique de filtrage : on filtre les cartes par niveau,
  // puis on ne garde que les sections qui ont au moins une carte correspondante.
  const filteredSections = verbesSections
    .map((section) => {
      const filteredCards = section.cards.filter(
        (card) => levelFilter === "all" || card.level === levelFilter,
      );
      return { ...section, cards: filteredCards };
    })
    .filter((section) => section.cards.length > 0);

  return (
    <>
      <div className="filter-container">
        <button
          onClick={() => setLevelFilter("all")}
          className={`filter-btn ${levelFilter === "all" ? "active" : ""}`}
        >
          Tout voir
        </button>
        <button
          onClick={() => setLevelFilter(1)}
          className={`filter-btn ${levelFilter === 1 ? "active" : ""}`}
        >
          Niveau 1
        </button>
        <button
          onClick={() => setLevelFilter(2)}
          className={`filter-btn ${levelFilter === 2 ? "active" : ""}`}
        >
          Niveau 2
        </button>
      </div>

      {/* Affichage des sections filtrées */}
      {filteredSections.map((section, i) => (
        <Section key={i} title={section.title} defaultOpen={false}>
          {section.cards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </Section>
      ))}

      {/* Message si aucun résultat n'est trouvé */}
      {filteredSections.length === 0 && (
        <p style={{ textAlign: "center", color: "#999", marginTop: "50px" }}>
          Aucun verbe trouvé pour ce niveau.
        </p>
      )}
    </>
  );
}
