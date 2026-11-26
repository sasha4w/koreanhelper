import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import VocabCard from "../components/VocabCard";
import SearchBar from "../components/SearchBar";
import ChipList from "../components/ChipList";
import CardGrid from "../components/CardGrid";
import DetailPanel from "../components/DetailPanel";
import MasteryBar from "../components/MasteryBar";
import { Target } from "../components/Icon";
import { useTable } from "../hooks/useTable";
import { useLang } from "../lib/i18n/LangProvider";
import { levelOptions, matchesLevel } from "../lib/levels";
import { TYPE_COLORS } from "../lib/constants";
import { normalizeFr } from "../lib/normalize";
import { getMasteryDistribution } from "../lib/mastery";
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

export default function Vocabulaire() {
  const { data: words, loading, error } = useTable("vocabulaire");
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const [level, setLevel] = useState("all");
  const [groupBy, setGroupBy] = useState("theme");
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState(null);

  // Force un recalcul de la répartition de maîtrise après chaque session
  // (recordAnswer/recordSession notifient les abonnés de progress.js).
  const [progressTick, setProgressTick] = useState(0);
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

  // `progressTick` ne sert qu'à déclencher un recalcul quand progress.js
  // notifie un changement (fin de session) — il n'est pas lu dans le corps.
  const masteryDistribution = useMemo(
    () => getMasteryDistribution(filtered),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, progressTick],
  );

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

      <MasteryBar counts={masteryDistribution} />

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

        <ul className="mastery-legend-criteria">
          <li>
            <span className="mastery-bar-dot mastery-new" />
            <strong>{lang === "en" ? "New" : "Nouveau"}</strong> — {lang === "en" ? "word never encountered" : "mot jamais rencontré"}
          </li>
          <li>
            <span className="mastery-bar-dot mastery-learning" />
            <strong>{lang === "en" ? "Learning" : "En cours"}</strong> — {lang === "en" ? "levels 1–2, seen often" : "niveaux 1–2, revient souvent"}
          </li>
          <li>
            <span className="mastery-bar-dot mastery-almost" />
            <strong>{lang === "en" ? "Almost mastered" : "Presque acquis"}</strong> — {lang === "en" ? "levels 3–4, reviewed less often" : "niveaux 3–4, revu de plus en plus rarement"}
          </li>
          <li>
            <span className="mastery-bar-dot mastery-mastered" />
            <strong>{lang === "en" ? "Mastered" : "Maîtrisé"}</strong> — {lang === "en" ? "level 5, comes back only for occasional recall" : "niveau 5, ne revient que pour un rappel ponctuel"}
          </li>
        </ul>
        <p className="mastery-legend-note">
          {lang === "en"
            ? "A correct answer raises the word one level, a mistake lowers it (two levels from level 4). Multiple-choice and matching exercises can raise a word up to level 3 only: beyond that, you need to type it."
            : "Une bonne réponse fait monter le mot d'un niveau, une erreur le fait descendre (de deux depuis le niveau 4). Les QCM et associations font monter jusqu'au niveau 3 seulement : au-delà, il faut l'écrire."}
        </p>
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
