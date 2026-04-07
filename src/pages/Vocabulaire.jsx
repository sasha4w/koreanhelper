import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";
import VocabCard from "../components/VocabCard";

const TYPE_COLORS = {
  명사: { bg: "#EEEDFE", color: "#3C3489" },
  동사: { bg: "#E1F5EE", color: "#085041" },
  형용사: { bg: "#FAECE7", color: "#993C1D" },
  부사: { bg: "#FAEEDA", color: "#854F0B" },
};

function VocabSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-section">
      <button
        className={`accordion-header ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="accordion-title">{title}</span>
        <span className="accordion-chevron">{isOpen ? "▲" : "▼"}</span>
      </button>
      <div
        className={`accordion-body vocab-accordion-body ${isOpen ? "open" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function Vocabulaire() {
  const [words, setWords] = useState([]);
  const [level, setLevel] = useState("all");
  const [groupBy, setGroupBy] = useState("theme");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("vocabulaire").select("*");
      if (error) console.error(error);
      else setWords(data);
      setLoading(false);
    };
    fetchWords();
  }, []);

  const filtered = words.filter(
    (w) => level === "all" || String(w.level) === String(level),
  );

  const groups = filtered.reduce((acc, w) => {
    const key =
      groupBy === "theme" ? w.theme || "—" : "Chapitre " + (w.chapitre || "—");
    if (!acc[key]) acc[key] = [];
    acc[key].push(w);
    return acc;
  }, {});

  const sortedKeys = Object.keys(groups).sort();

  if (loading) return <div className="loader">Chargement...</div>;

  return (
    <>
      {/* Légende */}
      <div className="legend">
        <span className="legend-label">Types :</span>
        {Object.entries(TYPE_COLORS).map(([type, s]) => (
          <span
            key={type}
            className="tag"
            style={{ background: s.bg, color: s.color }}
          >
            {type}
          </span>
        ))}
      </div>

      {/* Filtres niveau */}
      <div className="filter-container">
        <div className="filter-group">
          {[
            { value: "all", label: "Tout voir" },
            { value: "1", label: "Niveau 1" },
            { value: "2", label: "Niveau 2" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setLevel(value)}
              className={`filter-btn ${level === value ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="filter-divider" />

        {/* Filtres groupement */}
        <div className="filter-group">
          {[
            { value: "theme", label: "Par thème" },
            { value: "chapitre", label: "Par chapitre" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setGroupBy(value)}
              className={`filter-btn secondary ${groupBy === value ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      {sortedKeys.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa" }}>Aucun mot trouvé.</p>
      ) : (
        sortedKeys.map((key) => (
          <VocabSection key={key} title={key}>
            <VocabCard groupTitle={key} words={groups[key]} />
          </VocabSection>
        ))
      )}
    </>
  );
}
