import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const STATES = {
  SELECT: "select", // choix du chapitre
  QUIZ: "quiz", // en cours
  RESULT: "result", // résultats finaux
};

export default function Quiz() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState(STATES.SELECT);
  const [chapter, setChapter] = useState(null);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // null | "correct" | "wrong"
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchWords = async () => {
      const { data, error } = await supabase.from("vocabulaire").select("*");
      if (!error) setWords(data);
      setLoading(false);
    };
    fetchWords();
  }, []);

  // chapitres disponibles
  const chapters = [
    ...new Set(words.map((w) => w.chapitre).filter(Boolean)),
  ].sort((a, b) => Number(a) - Number(b));

  const startQuiz = (ch) => {
    const pool = shuffle(
      words.filter((w) => String(w.chapitre) === String(ch)),
    );
    setChapter(ch);
    setQueue(pool);
    setIndex(0);
    setInput("");
    setFeedback(null);
    setScore(0);
    setMistakes([]);
    setScreen(STATES.QUIZ);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const current = queue[index];
  const total = queue.length;

  const handleSubmit = () => {
    if (!current || feedback) return;
    const answer = input.trim();
    const correct = current.hangul?.trim();
    const isOk = answer === correct;

    setFeedback(isOk ? "correct" : "wrong");
    if (isOk) {
      setScore((s) => s + 1);
    } else {
      setMistakes((m) => [...m, { word: current, given: answer }]);
    }
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      setScreen(STATES.RESULT);
    } else {
      setIndex((i) => i + 1);
      setInput("");
      setFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      if (feedback) handleNext();
      else handleSubmit();
    }
  };

  const restart = () => {
    setScreen(STATES.SELECT);
    setChapter(null);
  };

  const retryMistakes = () => {
    const pool = shuffle(mistakes.map((m) => m.word));
    setQueue(pool);
    setIndex(0);
    setInput("");
    setFeedback(null);
    setScore(0);
    setMistakes([]);
    setScreen(STATES.QUIZ);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (loading) return <div className="loader">Chargement...</div>;

  /* ── SÉLECTION ── */
  if (screen === STATES.SELECT) {
    return (
      <div className="quiz-wrap">
        <h2 className="quiz-heading">Choisir un chapitre</h2>
        <p className="quiz-sub">
          Tu devras écrire le 한글 à partir de la traduction française.
        </p>
        <div className="quiz-chapters">
          {chapters.map((ch) => {
            const count = words.filter(
              (w) => String(w.chapitre) === String(ch),
            ).length;
            return (
              <button
                key={ch}
                className="quiz-chapter-btn"
                onClick={() => startQuiz(ch)}
              >
                <span className="quiz-chapter-num">Chapitre {ch}</span>
                <span className="quiz-chapter-count">{count} mots</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── QUIZ ── */
  if (screen === STATES.QUIZ) {
    const progress = (index / total) * 100;

    return (
      <div className="quiz-wrap">
        {/* Progress bar */}
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="quiz-meta">
          <span>Chapitre {chapter}</span>
          <span>
            {index + 1} / {total}
          </span>
          <span className="quiz-score-inline">✓ {score}</span>
        </div>

        {/* Carte question */}
        <div className={`quiz-card ${feedback || ""}`}>
          {current.theme && <span className="tag">{current.theme}</span>}
          {current.type && <span className="tag">{current.type}</span>}

          <p className="quiz-fr">{current.fr}</p>

          {feedback && <p className="quiz-answer-reveal">{current.hangul}</p>}

          {feedback === "wrong" && (
            <p className="quiz-given">
              Ta réponse : <em>{input || "—"}</em>
            </p>
          )}
        </div>

        {/* Saisie */}
        <div className="quiz-input-row">
          <input
            ref={inputRef}
            className={`quiz-input ${feedback || ""}`}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={!!feedback}
            placeholder="Écris le 한글..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {!feedback ? (
            <button className="quiz-btn primary" onClick={handleSubmit}>
              Vérifier
            </button>
          ) : (
            <button className="quiz-btn next" onClick={handleNext}>
              {index + 1 >= total ? "Résultats →" : "Suivant →"}
            </button>
          )}
        </div>

        <button className="quiz-quit" onClick={restart}>
          Quitter
        </button>
      </div>
    );
  }

  /* ── RÉSULTATS ── */
  const pct = Math.round((score / total) * 100);
  const emoji = pct === 100 ? "🎉" : pct >= 70 ? "👍" : pct >= 40 ? "💪" : "😅";

  return (
    <div className="quiz-wrap">
      <div className="quiz-result-header">
        <span className="quiz-result-emoji">{emoji}</span>
        <h2 className="quiz-heading">
          {score} / {total}
        </h2>
        <p className="quiz-sub">
          {pct}% de réussite — Chapitre {chapter}
        </p>
      </div>

      {mistakes.length > 0 && (
        <>
          <h3 className="quiz-mistakes-title">À retravailler</h3>
          <div className="quiz-mistakes-list">
            {mistakes.map((m, i) => (
              <div key={i} className="quiz-mistake-row">
                <span className="fr">{m.word.fr}</span>
                <span className="quiz-arrow">→</span>
                <span className="kor">{m.word.hangul}</span>
                {m.given && (
                  <span className="quiz-given-small">({m.given})</span>
                )}
              </div>
            ))}
          </div>
          <button className="quiz-btn primary" onClick={retryMistakes}>
            Réessayer les erreurs ({mistakes.length})
          </button>
        </>
      )}

      <div className="quiz-result-actions">
        <button
          className="quiz-btn secondary"
          onClick={() => startQuiz(chapter)}
        >
          Recommencer ce chapitre
        </button>
        <button className="quiz-btn ghost" onClick={restart}>
          Changer de chapitre
        </button>
      </div>
    </div>
  );
}
