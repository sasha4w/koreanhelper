import { useState } from "react";
import Section from "../components/Section";
import Card from "../components/Card";
import { grammairesSections } from "../data/grammaireData";

export default function Grammaire() {
  const [levelFilter, setLevelFilter] = useState("all");

  // On filtre les sections et les cartes en fonction du niveau
  const filteredSections = grammairesSections
    .map((section) => {
      const filteredCards = section.cards.filter(
        (card) => levelFilter === "all" || card.level === levelFilter,
      );
      return { ...section, cards: filteredCards };
    })
    .filter((section) => section.cards.length > 0); // On cache la section si elle n'a plus de cartes

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

      {filteredSections.map((section, i) => (
        <Section key={i} title={section.title}>
          {section.cards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </Section>
      ))}
    </>
  );
}
