import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ExerciseRunner from "../components/ExerciseRunner";
import { useTables } from "../hooks/useTable";
import { deriveLevels } from "../lib/levels";
import {
  ALL_KINDS,
  availableThemes,
  buildSession,
} from "../lib/exercises/buildSession";
import { KIND_ICONS, KIND_LABELS, KINDS_NEEDING_IME } from "../lib/constants";
import "./Entrainement.css";

const TABLES = ["vocabulaire", "grammaire", "verbes", "exercices"];
const DB_KINDS = ["db-qcm", "db-blanks"];
const SELECTABLE_KINDS = [...ALL_KINDS, ...DB_KINDS];
const LENGTHS = [10, 15, 25, 40];
const STORAGE_KEY = "kh:prefs:v1";

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // stockage indisponible : les préférences ne survivront pas au rechargement
  }
}

export default function Entrainement() {
  const { data, loading, error } = useTables(TABLES);
  const [params, setParams] = useSearchParams();
  const prefs = useMemo(() => loadPrefs(), []);

  // Références stables fournies par le store : utilisables en dépendances.
  const {
    vocabulaire: vocab,
    grammaire,
    verbes,
    exercices: dbExercices,
  } = data;

  const levels = useMemo(
    () => deriveLevels(vocab, grammaire, verbes),
    [vocab, grammaire, verbes],
  );

  const [rawLevel, setLevel] = useState(params.get("level") || "all");
  const [theme, setTheme] = useState(params.get("theme") || "all");
  const [kinds, setKinds] = useState(
    () => new Set(prefs.kinds || SELECTABLE_KINDS),
  );
  const [count, setCount] = useState(prefs.count || 15);
  const [session, setSession] = useState(null);

  // Un niveau absent des données retombe sur « Tous » — pas besoin d'effet.
  const level = levels.includes(rawLevel) ? rawLevel : "all";

  const chapitre = params.get("chapitre");
  const partie = params.get("partie");

  const themes = useMemo(() => availableThemes(vocab, level), [vocab, level]);

  const filters = useMemo(
    () => ({
      level,
      theme,
      chapitre: chapitre != null ? Number(chapitre) : null,
      partie: partie != null ? Number(partie) : null,
    }),
    [level, theme, chapitre, partie],
  );

  const toggleKind = (kind) => {
    setKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      if (next.size === 0) return prev; // au moins un type actif
      savePrefs({ ...loadPrefs(), kinds: [...next] });
      return next;
    });
  };

  const start = (overrides = {}) => {
    const exercises = buildSession({
      vocab,
      grammaire,
      verbes,
      dbExercices,
      filters,
      kinds: [...kinds],
      count,
      ...overrides,
    });
    savePrefs({ ...loadPrefs(), kinds: [...kinds], count });
    if (exercises.length) setSession(exercises);
  };

  const preview = useMemo(() => {
    if (loading || session) return 0;
    return buildSession({
      vocab,
      grammaire,
      verbes,
      dbExercices,
      filters,
      kinds: [...kinds],
      count,
      useProgress: false,
      seed: 1,
    }).length;
  }, [
    loading,
    session,
    vocab,
    grammaire,
    verbes,
    dbExercices,
    filters,
    kinds,
    count,
  ]);

  if (loading) return <div className="loader">Chargement…</div>;
  if (error)
    return <p className="empty-state">Impossible de charger les données.</p>;

  if (session) {
    return (
      <ExerciseRunner
        key={session[0]?.id + session.length}
        exercises={session}
        onQuit={() => setSession(null)}
        onRestart={(pool) => setSession([...pool])}
      />
    );
  }

  const chapterLabel =
    chapitre != null ? `Chapitre ${chapitre} · Partie ${partie}` : null;

  return (
    <div className="stack loose">
      <header className="tr-hero">
        <span className="tr-hero-icon" aria-hidden="true">
          🎯
        </span>
        <h2>S'entraîner</h2>
        <p className="subtitle">
          Les exercices sont générés à partir de ton vocabulaire et de tes cours.
        </p>
      </header>

      {chapterLabel && (
        <div className="tr-scope">
          <span>Ciblé sur : {chapterLabel}</span>
          <button
            className="chip"
            onClick={() => {
              params.delete("chapitre");
              params.delete("partie");
              setParams(params, { replace: true });
            }}
          >
            Retirer
          </button>
        </div>
      )}

      {/* Niveau */}
      <section className="tr-block">
        <h3 className="tr-label">Niveau</h3>
        <div className="scroll-x">
          <button
            className={`chip ${level === "all" ? "active" : ""}`}
            onClick={() => setLevel("all")}
          >
            Tous
          </button>
          {levels.map((l) => (
            <button
              key={l}
              className={`chip ${level === l ? "active" : ""}`}
              onClick={() => setLevel(l)}
            >
              Niveau {l}
            </button>
          ))}
        </div>
      </section>

      {/* Thème */}
      {themes.length > 1 && !chapterLabel && (
        <section className="tr-block">
          <h3 className="tr-label">Thème</h3>
          <div className="scroll-x">
            <button
              className={`chip accent ${theme === "all" ? "active" : ""}`}
              onClick={() => setTheme("all")}
            >
              Tous
            </button>
            {themes.map((t) => (
              <button
                key={t}
                className={`chip accent ${theme === t ? "active" : ""}`}
                onClick={() => setTheme(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Types d'exercices */}
      <section className="tr-block">
        <h3 className="tr-label">
          Types d'exercices
          <span className="tr-note">
            Décoche « Écrire en coréen » si tu n'as pas de clavier 한글.
          </span>
        </h3>
        <div className="tr-kinds">
          {SELECTABLE_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              className={`tr-kind ${kinds.has(kind) ? "active" : ""}`}
              onClick={() => toggleKind(kind)}
              aria-pressed={kinds.has(kind)}
            >
              <span aria-hidden="true">{KIND_ICONS[kind]}</span>
              <span>{KIND_LABELS[kind]}</span>
              {KINDS_NEEDING_IME.has(kind) && (
                <span className="tr-kind-ime" title="Clavier coréen requis">
                  한
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Longueur */}
      <section className="tr-block">
        <h3 className="tr-label">Longueur</h3>
        <div className="segmented-row">
          <div className="segmented">
            {LENGTHS.map((n) => (
              <button
                key={n}
                className={count === n ? "active" : ""}
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="stack tight">
        <button
          className="btn gradient block"
          onClick={() => start()}
          disabled={preview === 0}
        >
          {preview === 0
            ? "Aucun exercice possible avec ces filtres"
            : `Commencer (${Math.min(preview, count)} exercices)`}
        </button>
        <button
          className="btn secondary block"
          onClick={() => start({ useProgress: false })}
          disabled={preview === 0}
        >
          Session aléatoire (ignorer ma progression)
        </button>
      </div>
    </div>
  );
}
