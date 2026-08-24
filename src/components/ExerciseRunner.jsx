import { useCallback, useState } from "react";
import ExerciseCard from "./exercises/ExerciseCard";
import {
  checkAnswer,
  displayAnswer,
  emptyAnswer,
  isAnswerReady,
} from "../lib/exercises/check";
import { recordAnswer, recordSession } from "../lib/progress";
import { KIND_ICONS, KIND_LABELS } from "../lib/constants";
import "./ExerciseRunner.css";

/**
 * Moteur d'exécution commun à toutes les sessions (quiz, exercices générés,
 * exercices écrits à la main). Il ne sait rien de la provenance des exercices.
 */
export default function ExerciseRunner({
  exercises,
  title,
  onQuit,
  onRestart,
  trackProgress = true,
}) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [finished, setFinished] = useState(false);

  const current = exercises[index];
  const total = exercises.length;

  const handleResult = useCallback(
    (exo, ok, given) => {
      if (ok) setScore((s) => s + 1);
      else setMistakes((m) => [...m, { exo, given }]);

      if (trackProgress) {
        const keys = exo.sourceKeys || [exo.sourceKey];
        keys.filter(Boolean).forEach((key) => recordAnswer(key, ok));
      }
    },
    [trackProgress],
  );

  const next = useCallback(() => {
    if (index + 1 >= total) {
      // `score` est déjà à jour : handleResult a été appelé à la validation.
      if (trackProgress) recordSession({ count: total, score });
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, score, total, trackProgress]);

  /* ── Écran de résultat ── */
  if (finished || !current) {
    const pct = total ? Math.round((score / total) * 100) : 0;
    const emoji =
      pct === 100 ? "🎉" : pct >= 70 ? "👍" : pct >= 40 ? "💪" : "😅";

    return (
      <div className="stack loose">
        <div className="run-result">
          <span className="run-result-emoji" aria-hidden="true">
            {emoji}
          </span>
          <h2 className="run-result-score">
            {score} <span>/ {total}</span>
          </h2>
          <p className="subtitle">{pct}% de réussite</p>
        </div>

        {mistakes.length > 0 && (
          <div className="stack tight">
            <h3 className="run-section-title">À retravailler</h3>
            <ul className="run-mistakes">
              {mistakes.map((m, i) => (
                <li key={i} className="run-mistake">
                  <span className="run-mistake-q">
                    {m.exo.question || m.exo.prompt}
                  </span>
                  <span className="run-mistake-a">
                    <em className="wrong">{formatGiven(m.given) || "—"}</em>
                    <span aria-hidden="true">→</span>
                    <em className="right">{displayAnswer(m.exo)}</em>
                  </span>
                </li>
              ))}
            </ul>
            <button
              className="btn primary block"
              onClick={() => onRestart?.(mistakes.map((m) => m.exo))}
            >
              Réessayer les erreurs ({mistakes.length})
            </button>
          </div>
        )}

        <div className="stack tight">
          <button
            className="btn secondary block"
            onClick={() => onRestart?.(exercises)}
          >
            Refaire cette session
          </button>
          <button className="btn ghost block" onClick={onQuit}>
            Changer de session
          </button>
        </div>
      </div>
    );
  }

  /* ── Écran d'exercice ── */
  return (
    <div className="stack">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      <div className="run-meta">
        <span className="run-kind">
          <span aria-hidden="true">{KIND_ICONS[current.kind] || "✏️"}</span>{" "}
          {KIND_LABELS[current.kind] || title || "Exercice"}
        </span>
        <span>
          {index + 1} / {total}
        </span>
        <span className="run-score">✓ {score}</span>
      </div>

      {/* La `key` remonte le composant à chaque exercice : l'état de la
          réponse repart de zéro sans effet de synchronisation. */}
      <ExerciseStep
        key={current.id}
        exo={current}
        isLast={index + 1 >= total}
        onResult={handleResult}
        onNext={next}
        onQuit={onQuit}
      />
    </div>
  );
}

/* ───────────────── Un exercice, son état de réponse ───────────────── */

function ExerciseStep({ exo, isLast, onResult, onNext, onQuit }) {
  const [value, setValue] = useState(() => emptyAnswer(exo));
  const [submitted, setSubmitted] = useState(false);
  const [detail, setDetail] = useState({});
  const [ok, setOk] = useState(false);

  const submit = (forceWrong = false) => {
    if (submitted) return;
    const result = forceWrong
      ? { ok: false, detail: {} }
      : checkAnswer(exo, value);

    setSubmitted(true);
    setDetail(result.detail);
    setOk(result.ok);
    onResult(exo, result.ok, value);
  };

  const ready = isAnswerReady(exo, value);

  return (
    <>
      <div className={`run-card ${submitted ? (ok ? "correct" : "wrong") : ""}`}>
        <p className="run-prompt">{exo.prompt}</p>
        {exo.promptSub && <p className="run-prompt-sub">{exo.promptSub}</p>}
        {exo.grammarPoint && (
          <span className="run-grammar">📌 {exo.grammarPoint}</span>
        )}

        <ExerciseCard
          exo={exo}
          value={value}
          onChange={setValue}
          onSubmit={() => submit()}
          submitted={submitted}
          detail={detail}
        />

        {!submitted && exo.hint && <p className="run-hint">💡 {exo.hint}</p>}

        {submitted && !ok && (
          <p className="run-answer">
            Réponse : <strong>{displayAnswer(exo)}</strong>
          </p>
        )}

        {submitted && exo.explanation && (
          <p className="run-explanation">📖 {exo.explanation}</p>
        )}
      </div>

      <div className="stack tight">
        {!submitted ? (
          <>
            <button
              className="btn primary block"
              onClick={() => submit()}
              disabled={!ready}
            >
              Vérifier
            </button>
            <button className="btn ghost block" onClick={() => submit(true)}>
              Je ne sais pas — voir la réponse
            </button>
          </>
        ) : (
          <button className="btn next block" onClick={onNext} autoFocus>
            {isLast ? "Résultats →" : "Suivant →"}
          </button>
        )}
        <button className="btn ghost block" onClick={onQuit}>
          Quitter
        </button>
      </div>
    </>
  );
}

function formatGiven(given) {
  if (given == null) return "";
  if (Array.isArray(given)) return given.join(" ");
  if (typeof given === "object") return Object.values(given).join(" · ");
  return String(given);
}
