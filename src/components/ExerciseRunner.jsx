import { useCallback, useState, useEffect, useRef } from "react";
import ExerciseCard from "./exercises/ExerciseCard";
import {
  checkAnswer,
  displayAnswer,
  emptyAnswer,
  isAnswerReady,
} from "../lib/exercises/check";
import { recordAnswer, recordSession } from "../lib/progress";
import { DEFAULT_KIND_ICON, KIND_ICONS, KIND_LABELS } from "../lib/constants";
import { burstConfetti, animateCounter } from "../lib/animations";
import {
  Bulb,
  CheckCircle,
  ChevronRight,
  Pin,
  BookOpen,
  Flame,
  RotateCcw,
  ThumbsUp,
  Trophy,
  X,
  Zap,
} from "./Icon";
import "./ExerciseRunner.css";
import "../styles/animations.css";

function resultTier(pct) {
  if (pct === 100) return { Icon: Trophy, tone: "gold" };
  if (pct >= 70) return { Icon: ThumbsUp, tone: "good" };
  if (pct >= 40) return { Icon: Zap, tone: "mid" };
  return { Icon: RotateCcw, tone: "low" };
}

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
  const [combo, setCombo] = useState(0);
  const scoreRef = useRef(null);
  const pct = exercises.length ? Math.round((score / exercises.length) * 100) : 0;

  const current = exercises[index];
  const total = exercises.length;

  useEffect(() => {
    if (finished && pct >= 70) {
      burstConfetti();
    }
    if (finished && scoreRef.current) {
      animateCounter(scoreRef.current, score, 600);
    }
  }, [finished, pct, score]);

  const handleResult = useCallback(
    (exo, ok, given) => {
      if (ok) {
        setScore((s) => s + 1);
        setCombo((c) => {
          const next = c + 1;
          // Petit bonus visuel aux paliers de combo : pas à chaque bonne
          // réponse (ça deviendrait fatigant sur 15+ exercices).
          if (next >= 3 && next % 5 === 0) burstConfetti(16);
          return next;
        });
      } else {
        setMistakes((m) => [...m, { exo, given }]);
        setCombo(0);
      }

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
    const { Icon: ResultIcon, tone } = resultTier(pct);

    return (
      <div className="stack loose">
        <div className="run-result">
          <span className={`run-result-icon tone-${tone} result-pop`}>
            <ResultIcon />
          </span>
          <h2 className="run-result-score">
            <span ref={scoreRef}>0</span> <span>/ {total}</span>
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
  const KindIcon = KIND_ICONS[current.kind] || DEFAULT_KIND_ICON;

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
          <KindIcon /> {KIND_LABELS[current.kind] || title || "Exercice"}
        </span>
        <span>
          {index + 1} / {total}
        </span>
        <span className="run-score">
          <CheckCircle /> {score}
        </span>
        {combo >= 2 && (
          <span key={combo} className="run-combo">
            <Flame /> {combo}
          </span>
        )}
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
  // Pour "grammar-qcm", la réponse est révélée juste au-dessus de la question
  // par ExerciseCard lui-même : pas de doublon en bas de carte pour ce type.
  const showBottomAnswer = submitted && !ok && exo.kind !== "grammar-qcm";

  return (
    <>
      <div className={`run-card ${submitted ? (ok ? "correct" : "wrong") : ""}`}>
        {submitted && (
          <span className={`run-feedback-badge ${ok ? "correct" : "wrong"}`}>
            {ok ? <CheckCircle /> : <X />}
          </span>
        )}
        <p className="run-prompt">{exo.prompt}</p>
        {exo.promptSub && <p className="run-prompt-sub">{exo.promptSub}</p>}
        {exo.grammarPoint && (
          <span className="run-grammar">
            <Pin /> {exo.grammarPoint}
          </span>
        )}

        <ExerciseCard
          exo={exo}
          value={value}
          onChange={setValue}
          onSubmit={() => submit()}
          submitted={submitted}
          detail={detail}
        />

        {!submitted && exo.hint && (
          <p className="run-hint">
            <Bulb /> {exo.hint}
          </p>
        )}

        {showBottomAnswer && (
          <p className="run-answer">
            Réponse : <strong>{displayAnswer(exo)}</strong>
          </p>
        )}

        {submitted && exo.explanation && (
          <p className="run-explanation">
            <BookOpen /> {exo.explanation}
          </p>
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
            {isLast ? "Résultats" : "Suivant"} <ChevronRight />
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
