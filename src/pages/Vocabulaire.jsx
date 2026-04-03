import { useState } from "react";
import Section from "../components/Section";
import VocabCard from "../components/VocabCard";
import { vocabulaireSections } from "../data/vocabulaireData";

export default function Vocabulaire() {
  const [levelFilter, setLevelFilter] = useState("all");
  const [viewMode, setViewMode] = useState("theme"); // "theme" ou "chapter"

  // --------------------------------------------------
  // LOGIQUE 1 : VUE PAR THÉMATIQUE
  // --------------------------------------------------
  const themeSections = vocabulaireSections
    .map((section) => {
      const filteredCards = section.cards
        .map((card) => {
          // On filtre les MOTS par niveau
          const filteredWords = card.words.filter(
            (word) => levelFilter === "all" || word.level === levelFilter,
          );
          return { ...card, words: filteredWords };
        })
        .filter((card) => card.words.length > 0);
      return { ...section, cards: filteredCards };
    })
    .filter((section) => section.cards.length > 0);

  // --------------------------------------------------
  // LOGIQUE 2 : VUE PAR CHAPITRE (Chronologique)
  // --------------------------------------------------
  // 1. On extrait absolument tous les mots dans une seule grande liste
  const allWords = vocabulaireSections.flatMap((section) =>
    section.cards.flatMap((card) => card.words),
  );

  // 2. On filtre par niveau
  const levelFilteredWords = allWords.filter(
    (word) => levelFilter === "all" || word.level === levelFilter,
  );

  // 3. On les regroupe par chapitre (ex: { "1.1": [...mots], "1.2": [...mots] })
  const wordsByChapter = levelFilteredWords.reduce((acc, word) => {
    const chap = word.chapter || "Non classé"; // Sécurité si un mot n'a pas de chapitre
    if (!acc[chap]) acc[chap] = [];
    acc[chap].push(word);
    return acc;
  }, {});

  // 4. On trie les noms de chapitres pour l'affichage (1.1, 1.2, 2.1, etc.)
  const sortedChapters = Object.keys(wordsByChapter).sort();

  return (
    <>
      {/* --- BOUTONS DE SÉLECTION DE LA VUE --- */}
      <div
        className="view-toggle"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "15px",
        }}
      >
        <button
          onClick={() => setViewMode("theme")}
          className={`filter-btn ${viewMode === "theme" ? "active" : ""}`}
        >
          🗂️ Vue par Thèmes
        </button>
        <button
          onClick={() => setViewMode("chapter")}
          className={`filter-btn ${viewMode === "chapter" ? "active" : ""}`}
        >
          📖 Vue par Chapitres
        </button>
      </div>

      {/* --- BOUTONS DE FILTRE DE NIVEAU --- */}
      <div className="filter-container">
        <button
          onClick={() => setLevelFilter("all")}
          className={`filter-btn ${levelFilter === "all" ? "active" : ""}`}
        >
          Tous les niveaux
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

      {/* --- AFFICHAGE SELON LA VUE CHOISIE --- */}
      {viewMode === "theme"
        ? // Rendu Thématique
          themeSections.map((section, i) => (
            <Section key={i} title={section.title} defaultOpen={false}>
              {section.cards.map((card, index) => (
                <VocabCard key={index} theme={card.theme} words={card.words} />
              ))}
            </Section>
          ))
        : // Rendu Chronologique
          sortedChapters.map((chap, i) => (
            <Section key={i} title={`Chapitre ${chap}`} defaultOpen={false}>
              <VocabCard
                theme={`Mots du chapitre ${chap}`}
                words={wordsByChapter[chap]}
              />
            </Section>
          ))}

      {/* --- MESSAGE VIDE --- */}
      {viewMode === "theme" && themeSections.length === 0 && (
        <p style={{ textAlign: "center", color: "gray" }}>
          Aucun vocabulaire pour ce niveau.
        </p>
      )}
      {viewMode === "chapter" && sortedChapters.length === 0 && (
        <p style={{ textAlign: "center", color: "gray" }}>
          Aucun vocabulaire pour ce niveau.
        </p>
      )}
    </>
  );
}
