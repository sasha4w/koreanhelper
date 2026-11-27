import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VocabCard from "../components/VocabCard";
import SearchBar from "../components/SearchBar";
import ChipList from "../components/ChipList";
import CardGrid from "../components/CardGrid";
import DetailPanel from "../components/DetailPanel";
import { Target } from "../components/Icon";
import { useTable } from "../hooks/useTable";
import { useLang } from "../lib/i18n/LangProvider";
import { levelOptions, matchesLevel } from "../lib/levels";
import { TYPE_COLORS } from "../lib/constants";
import { normalizeFr } from "../lib/normalize";
import { subscribe } from "../lib/progress";
import "./Vocabulaire.css";

const THEME_LABELS = {
  fr: {
    lieux: "Lieux",
    adjectifs: "Adjectifs",
    verbes: "Verbes",
    nouns: "Noms",
    particles: "Particules",
    numbers: "Nombres",
    days: "Jours",
    time: "Temps",
    actions: "Actions",
    descriptive: "Mots descriptifs",
    colors: "Couleurs",
    food: "Nourriture",
    family: "Famille",
    body: "Parties du corps",
    clothes: "Vêtements",
    emotions: "Émotions",
  },
  en: {
    lieux: "Places",
    adjectifs: "Adjectives",
    verbes: "Verbs",
    nouns: "Nouns",
    particles: "Particles",
    numbers: "Numbers",
    days: "Days",
    time: "Time",
    actions: "Actions",
    descriptive: "Descriptive words",
    colors: "Colors",
    food: "Food",
    family: "Family",
    body: "Body parts",
    clothes: "Clothes",
    emotions: "Emotions",
  },
};

const MASTERY_LEGEND = [
  ["new", "Nouveau", "New"],
  ["learning", "En cours", "Learning"],
  ["almost", "Presque acquis", "Almost mastered"],
  ["mastered", "Maîtrisé", "Mastered"],
];

export default function Vocabulaire() {
  const { data: words, loading, error } = useTable("vocabulaire");
  const navigate = useNavigate();
  const { lang } = useLang();
  const [level, setLevel] = useState("all");
  const [groupBy, setGroupBy] = useState("theme");
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState(null);

  // Re-rendu après chaque réponse : les cartes affichent le niveau de
  // maîtrise de chaque mot (recordAnswer notifie les abonnés de progress.js).
  const [, setProgressTick] = useState(0);
  useEffect(() => subscribe(() => setProgressTick((t) => t + 1)), []);

  const levels = useMemo(() => levelOptions(words), [words]);

  const filtered = useMemo(() => {
    const needle = normalizeFr(search);
    return words.filter((w) => {
      if (!matchesLevel(w, level)) return false;
      if (!needle) return true;
      const fr_match = normalizeFr(w.fr || "").includes(needle);
      const en_match = lang === "en" && w.en ? normalizeFr(w.en || "").includes(needle) : false;
      const hangul_match = String(w.hangul || "").includes(search.trim());
      return fr_match || en_match || hangul_match;
    });
  }, [words, level, search, lang]);

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
    const locale = lang === "en" ? "en" : "fr";
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, locale));
  }, [filtered, groupBy, lang]);

  const groupLabel = (key) => {
    if (groupBy === "theme") {
      // Try to translate the theme name using the lookup table
      const themeKey = key.toLowerCase().replace(/\s+/g, "");
      const themeLangDict = THEME_LABELS[lang] || THEME_LABELS.fr;
      return themeLangDict[themeKey] || key;
    }
    const [chap, part] = key.split("-");
    const chapLabel = lang === "en" ? "Chapter" : "Chapitre";
    const partLabel = lang === "en" ? "Part" : "Partie";
    return `${chapLabel} ${parseInt(chap, 10)} · ${partLabel} ${part}`;
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

  const selectedGroup = groups.find(([key]) => key === selectedKey);

  if (loading) return <div className="loader">Chargement…</div>;
  if (error)
    return <p className="empty-state">Impossible de charger le vocabulaire.</p>;

  return (
    <div className="stack">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={lang === "en" ? "Search a word (English or 한글)" : "Chercher un mot (français ou 한글)"}
      />

      {/* Filtres */}
      <ChipList options={levels} value={level} onChange={setLevel} />

      <div className="segmented-row">
        <div className="segmented">
          <button
            className={groupBy === "theme" ? "active" : ""}
            onClick={() => setGroupBy("theme")}
          >
            {lang === "en" ? "By theme" : "Par thème"}
          </button>
          <button
            className={groupBy === "chapitre" ? "active" : ""}
            onClick={() => setGroupBy("chapitre")}
          >
            {lang === "en" ? "By chapter" : "Par chapitre"}
          </button>
        </div>
      </div>

      <p className="vocab-count">
        {filtered.length} {lang === "en" ? (filtered.length > 1 ? "words" : "word") : (filtered.length > 1 ? "mots" : "mot")}
      </p>

      {/* Légende */}
      <details className="vocab-legend-wrap">
        <summary>{lang === "en" ? "Legend" : "Légende"}</summary>
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

        {/* Couleur du liseré des cartes = niveau de maîtrise du mot */}
        <ul className="mastery-legend">
          {MASTERY_LEGEND.map(([tier, fr, en]) => (
            <li key={tier}>
              <span className={`mastery-dot tier-${tier}`} />
              {lang === "en" ? en : fr}
            </li>
          ))}
        </ul>
        <Link to="/progres" className="mastery-legend-link">
          {lang === "en"
            ? "How mastery works · my progress →"
            : "Comment fonctionne la maîtrise · ma progression →"}
        </Link>
      </details>

      {groups.length === 0 ? (
        <p className="empty-state">{lang === "en" ? "No words found." : "Aucun mot trouvé."}</p>
      ) : (
        <CardGrid
          items={groups.map(([key, items]) => ({
            key,
            title: groupLabel(key),
            countLabel: `${items.length} ${lang === "en" ? (items.length > 1 ? "words" : "word") : (items.length > 1 ? "mots" : "mot")}`,
          }))}
          onSelect={setSelectedKey}
        />
      )}

      <DetailPanel
        open={Boolean(selectedGroup)}
        title={selectedGroup ? groupLabel(selectedGroup[0]) : ""}
        subtitle={selectedGroup ? `${selectedGroup[1].length} ${lang === "en" ? (selectedGroup[1].length > 1 ? "words" : "word") : (selectedGroup[1].length > 1 ? "mots" : "mot")}` : ""}
        onClose={() => setSelectedKey(null)}
      >
        {selectedGroup && (
          <div className="stack">
            <VocabCard words={selectedGroup[1]} />
            <button
              className="btn primary block"
              onClick={() => practice(selectedGroup[0], selectedGroup[1])}
            >
              <Target /> {lang === "en" ? "Practice this group" : "S'entraîner sur ce groupe"}
            </button>
          </div>
        )}
      </DetailPanel>
    </div>
  );
}
