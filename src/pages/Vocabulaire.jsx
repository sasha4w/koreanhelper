import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import VocabCard from "../components/VocabCard";
import "./Vocabulaire.css";

const TYPE_COLORS = {
  명사: { bg: "#EEEDFE", color: "#3C3489" },
  동사: { bg: "#E1F5EE", color: "#085041" },
  형용사: { bg: "#FAECE7", color: "#993C1D" },
  부사: { bg: "#FAEEDA", color: "#854F0B" },
  expression: { bg: "#FDE8F5", color: "#7B1F6A" },
  의존명사: { bg: "#E8F0FD", color: "#1A3A8A" },
  관형사: { bg: "#FDF3E8", color: "#8A4A1A" },
  대명사: { bg: "#E8FDF3", color: "#1A6A4A" },
  접속사: { bg: "#F3E8FD", color: "#5A1A8A" },
  조사: { bg: "#FDE8E8", color: "#8A1A1A" },
};

function VocabSection({ title, count, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="accordion-section">
      <button
        className={`accordion-header ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <span className="accordion-title">{title}</span>
        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.75em", opacity: 0.7 }}>{count} mots</span>
          <span className="accordion-chevron">{isOpen ? "▲" : "▼"}</span>
        </span>
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
      const { data, error } = await supabase
        .from("vocabulaire")
        .select("*")
        .order("chapitre", { ascending: true })
        .order("partie", { ascending: true })
        .range(0, 9999); // ✅ lève la limite des 1000 lignes
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
    let key;
    if (groupBy === "theme") {
      key = w.theme || "—";
    } else {
      key = `${String(w.chapitre).padStart(3, "0")}-${w.partie}`;
    }
    if (!acc[key]) acc[key] = [];
    acc[key].push(w);
    return acc;
  }, {});

  const sortedKeys = Object.keys(groups).sort();

  const getGroupLabel = (key) => {
    if (groupBy === "theme") return key;
    const [chap, part] = key.split("-");
    return `Chapitre ${parseInt(chap)} · Partie ${part}`;
  };

  if (loading) return <div className="loader">Chargement...</div>;

  return (
    <>
      {/* Légende des types */}
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

      {/* Filtres */}
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

      {/* Accordions */}
      {sortedKeys.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa" }}>Aucun mot trouvé.</p>
      ) : (
        sortedKeys.map((key) => (
          <VocabSection
            key={key}
            title={getGroupLabel(key)}
            count={groups[key].length}
          >
            <VocabCard words={groups[key]} />
          </VocabSection>
        ))
      )}
    </>
  );
}
