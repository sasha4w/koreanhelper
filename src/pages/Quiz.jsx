import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const STATES = {
  SELECT: "select",
  QUIZ: "quiz",
  RESULT: "result",
};

export default function Quiz() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("1");
  const [screen, setScreen] = useState(STATES.SELECT);
  const [chapter, setChapter] = useState(null); // { chapitre, partie }
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchWords = async () => {
      const { data, error } = await supabase
        .from("vocabulaire")
        .select("*")
        .order("chapitre", { ascending: true })
        .order("partie", { ascending: true });
      if (!error) setWords(data);
      setLoading(false);
    };
    fetchWords();
  }, []);

  const filteredWords = words.filter((w) => String(w.level) === String(level));

  // Extraire les paires uniques (chapitre, partie) triées
  const chapters = filteredWords
    .reduce((acc, w) => {
      if (w.chapitre == null || w.partie == null) return acc;
      const exists = acc.find(
        (c) => c.chapitre === w.chapitre && c.partie === w.partie,
      );
      if (!exists) acc.push({ chapitre: w.chapitre, partie: w.partie });
      return acc;
    }, [])
    .sort((a, b) =>
      a.chapitre !== b.chapitre ? a.chapitre - b.chapitre : a.partie - b.partie,
    );

  const startQuiz = ({ chapitre, partie }) => {
    const pool = shuffle(
      filteredWords.filter(
        (w) => w.chapitre === chapitre && w.partie === partie,
      ),
    );
    setChapter({ chapitre, partie });
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
    if (isOk) setScore((s) => s + 1);
    else setMistakes((m) => [...m, { word: current, given: answer }]);
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

        <div
          className="filter-container"
          style={{ justifyContent: "center", marginBottom: "2rem" }}
        >
          <div className="filter-group">
            {[
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
        </div>

        <div className="quiz-chapters">
          {chapters.length === 0 ? (
            <p style={{ textAlign: "center", color: "#aaa", width: "100%" }}>
              Aucun mot trouvé pour ce niveau.
            </p>
          ) : (
            chapters.map(({ chapitre, partie }) => {
              const count = filteredWords.filter(
                (w) => w.chapitre === chapitre && w.partie === partie,
              ).length;
              return (
                <button
                  key={`${chapitre}-${partie}`}
                  className="quiz-chapter-btn"
                  onClick={() => startQuiz({ chapitre, partie })}
                >
                  <span className="quiz-chapter-num">
                    Chapitre {chapitre} · Partie {partie}
                  </span>
                  <span className="quiz-chapter-count">{count} mots</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  /* ── QUIZ ── */
  if (screen === STATES.QUIZ) {
    const progress = (index / total) * 100;
    return (
      <div className="quiz-wrap">
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="quiz-meta">
          <span>
            Chapitre {chapter.chapitre} · Partie {chapter.partie} (Niv {level})
          </span>
          <span>
            {index + 1} / {total}
          </span>
          <span className="quiz-score-inline">✓ {score}</span>
        </div>

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
          {pct}% de réussite — Chapitre {chapter.chapitre} · Partie{" "}
          {chapter.partie} (Niveau {level})
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
