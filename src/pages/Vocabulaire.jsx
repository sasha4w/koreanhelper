import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import VocabCard from "../components/VocabCard";
import SearchBar from "../components/SearchBar";
import ChipList from "../components/ChipList";
import { Target } from "../components/Icon";
import { useTable } from "../hooks/useTable";
import { levelOptions, matchesLevel } from "../lib/levels";
import { TYPE_COLORS } from "../lib/constants";
import { normalizeFr } from "../lib/normalize";
import "./Vocabulaire.css";

function VocabSection({ title, count, onPractice, defaultOpen, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen || false);
  return (
    <div className="accordion-section">
      <button
        type="button"
        className={`accordion-header ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <span className="accordion-title">{title}</span>
        <span className="accordion-right">
          <span className="accordion-count">{count} mots</span>
          <span className="accordion-chevron" aria-hidden="true">
            {isOpen ? "▲" : "▼"}
          </span>
        </span>
      </button>

      <div className={`accordion-body ${isOpen ? "open" : ""}`}>
        <div className="accordion-body-inner vocab-accordion-inner">
          {children}
          {onPractice && (
            <div className="vocab-group-actions">
              <button className="chip accent active" onClick={onPractice}>
                <Target /> S'entraîner sur ce groupe
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Vocabulaire() {
  const { data: words, loading, error } = useTable("vocabulaire");
  const navigate = useNavigate();
  const [level, setLevel] = useState("all");
  const [groupBy, setGroupBy] = useState("theme");
  const [search, setSearch] = useState("");

  const levels = useMemo(() => levelOptions(words), [words]);

  const filtered = useMemo(() => {
    const needle = normalizeFr(search);
    return words.filter((w) => {
      if (!matchesLevel(w, level)) return false;
      if (!needle) return true;
      return (
        normalizeFr(w.fr || "").includes(needle) ||
        String(w.hangul || "").includes(search.trim())
      );
    });
  }, [words, level, search]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const w of filtered) {
      const key =
        groupBy === "theme"
          ? w.theme || "—"
          : `${String(w.chapitre).padStart(3, "0")}-${w.partie}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(w);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, "fr"));
  }, [filtered, groupBy]);

  const searching = Boolean(search.trim());

  const groupLabel = (key) => {
    if (groupBy === "theme") return key;
    const [chap, part] = key.split("-");
    return `Chapitre ${parseInt(chap, 10)} · Partie ${part}`;
  };

  const practice = (key, items) => {
    const params = new URLSearchParams({ level });
    if (groupBy === "theme") params.set("theme", key);
    else {
      params.set("chapitre", String(items[0].chapitre));
      params.set("partie", String(items[0].partie));
    }
    navigate(`/entrainement?${params.toString()}`);
  };

  if (loading) return <div className="loader">Chargement…</div>;
  if (error)
    return <p className="empty-state">Impossible de charger le vocabulaire.</p>;

  return (
    <div className="stack">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Chercher un mot (français ou 한글)"
      />

      {/* Filtres */}
      <ChipList options={levels} value={level} onChange={setLevel} />

      <div className="segmented-row">
        <div className="segmented">
          <button
            className={groupBy === "theme" ? "active" : ""}
            onClick={() => setGroupBy("theme")}
          >
            Par thème
          </button>
          <button
            className={groupBy === "chapitre" ? "active" : ""}
            onClick={() => setGroupBy("chapitre")}
          >
            Par chapitre
          </button>
        </div>
      </div>

      <p className="vocab-count">
        {filtered.length} mot{filtered.length > 1 ? "s" : ""}
      </p>

      {/* Légende des types */}
      <details className="vocab-legend-wrap">
        <summary>Légende des types</summary>
        <div className="legend">
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
      </details>

      {groups.length === 0 ? (
        <p className="empty-state">Aucun mot trouvé.</p>
      ) : (
        groups.map(([key, items]) => (
          <VocabSection
            /* En recherche, les sections se remontent ouvertes : sinon les
               résultats restent cachés derrière des accordéons fermés. */
            key={`${key}:${searching}`}
            title={groupLabel(key)}
            count={items.length}
            defaultOpen={searching}
            onPractice={() => practice(key, items)}
          >
            <VocabCard words={items} />
          </VocabSection>
        ))
      )}
    </div>
  );
}
