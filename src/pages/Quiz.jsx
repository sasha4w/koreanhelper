import { useMemo, useState } from "react";
import ExerciseRunner from "../components/ExerciseRunner";
import { useTable } from "../hooks/useTable";
import { deriveLevels } from "../lib/levels";
import { availableChapters } from "../lib/exercises/buildSession";
import { makeRng } from "../lib/exercises/rng";
import { GENERATORS_BY_KIND } from "../lib/exercises/generators";
import "./Quiz.css";

const DIRECTIONS = [
  { value: "fr-to-ko", label: "FR → 한글" },
  { value: "ko-to-fr", label: "한글 → FR" },
];

export default function Quiz() {
  const { data: words, loading, error } = useTable("vocabulaire");
  const [level, setLevel] = useState(null);
  const [direction, setDirection] = useState("fr-to-ko");
  const [session, setSession] = useState(null);

  const levels = useMemo(() => deriveLevels(words), [words]);
  const activeLevel = level ?? levels[0] ?? "all";

  const chapters = useMemo(
    () => availableChapters(words, activeLevel),
    [words, activeLevel],
  );

  const startChapter = ({ chapitre, partie }) => {
    const rng = makeRng();
    const pool = words.filter(
      (w) =>
        String(w.level) === String(activeLevel) &&
        w.chapitre === chapitre &&
        w.partie === partie,
    );
    const generator = GENERATORS_BY_KIND[direction];
    const exercises = rng
      .shuffle(pool)
      .map((w) => generator.generate(w, pool, rng))
      .filter(Boolean);

    if (exercises.length) setSession(exercises);
  };

  if (loading) return <div className="loader">Chargement…</div>;
  if (error)
    return <p className="empty-state">Impossible de charger le vocabulaire.</p>;

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

  return (
    <div className="stack loose">
      <header className="quiz-hero">
        <span className="quiz-hero-icon" aria-hidden="true">
          🧠
        </span>
        <h2>Quiz par chapitre</h2>
        <p className="subtitle">
          Révise tout le vocabulaire d'une partie, mot par mot.
        </p>
      </header>

      <div className="segmented-row">
        <div className="segmented">
          {DIRECTIONS.map(({ value, label }) => (
            <button
              key={value}
              className={direction === value ? "active" : ""}
              onClick={() => setDirection(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {levels.length > 1 && (
        <div className="scroll-x">
          {levels.map((l) => (
            <button
              key={l}
              className={`chip ${activeLevel === l ? "active" : ""}`}
              onClick={() => setLevel(l)}
            >
              Niveau {l}
            </button>
          ))}
        </div>
      )}

      {chapters.length === 0 ? (
        <p className="empty-state">Aucun mot trouvé pour ce niveau.</p>
      ) : (
        <div className="quiz-chapters">
          {chapters.map(({ chapitre, partie, count }) => (
            <button
              key={`${chapitre}-${partie}`}
              className="quiz-chapter"
              onClick={() => startChapter({ chapitre, partie })}
            >
              <span className="quiz-chapter-num">
                Chapitre {chapitre} · Partie {partie}
              </span>
              <span className="quiz-chapter-count">{count} mots</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
