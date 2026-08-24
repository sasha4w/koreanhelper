import { useEffect, useRef } from "react";
import { BLANK_KINDS, CHOICE_KINDS } from "../../lib/exercises/check";
import "./ExerciseCard.css";

/**
 * Rend le corps d'un exercice selon son `kind`.
 * Le runner reste maître de l'état : ce composant ne fait qu'afficher et remonter.
 */
export default function ExerciseCard({
  exo,
  value,
  onChange,
  onSubmit,
  submitted,
  detail,
}) {
  if (exo.kind === "matching") {
    return (
      <MatchingBody {...{ exo, value, onChange, submitted, detail }} />
    );
  }
  if (exo.kind === "sentence-order") {
    return <OrderBody {...{ exo, value, onChange, submitted }} />;
  }
  if (BLANK_KINDS.has(exo.kind)) {
    return (
      <BlanksBody {...{ exo, value, onChange, onSubmit, submitted, detail }} />
    );
  }
  if (CHOICE_KINDS.has(exo.kind)) {
    return <ChoiceBody {...{ exo, value, onChange, submitted }} />;
  }
  return <InputBody {...{ exo, value, onChange, onSubmit, submitted }} />;
}

/* ───────────────── Saisie libre ───────────────── */

function InputBody({ exo, value, onChange, onSubmit, submitted }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!submitted) ref.current?.focus();
  }, [exo.id, submitted]);

  return (
    <>
      <p className="ex-question">{exo.question}</p>
      <input
        ref={ref}
        className="ex-input"
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        disabled={submitted}
        placeholder={exo.lang === "ko" ? "한글..." : "Ta réponse..."}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        lang={exo.lang === "ko" ? "ko" : "fr"}
        aria-label="Ta réponse"
      />
    </>
  );
}

/* ───────────────── QCM ───────────────── */

function ChoiceBody({ exo, value, onChange, submitted }) {
  return (
    <>
      {exo.question && (
        <p className={`ex-question ${exo.questionLang === "ko" ? "ko" : ""}`}>
          {exo.question}
        </p>
      )}
      <div className="ex-choices">
        {exo.choices.map((choice, i) => {
          let cls = "ex-choice";
          if (submitted) {
            if (choice === exo.expected) cls += " correct";
            else if (choice === value) cls += " wrong";
          } else if (choice === value) {
            cls += " selected";
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => !submitted && onChange(choice)}
              disabled={submitted}
            >
              <span className="ex-choice-letter" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <span className={exo.choicesLang === "ko" ? "ko" : ""}>
                {choice}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ───────────────── Texte à trous ───────────────── */

function BlanksBody({ exo, value, onChange, onSubmit, submitted, detail }) {
  const refs = useRef({});
  const blanks = exo.segments.filter((s) => s.type === "blank");

  useEffect(() => {
    if (!submitted) refs.current[blanks[0]?.index]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exo.id, submitted]);

  const handleKey = (e, index) => {
    if (e.key !== "Enter") return;
    if (submitted) return onSubmit();
    const nextBlank = blanks.find((b) => b.index > index);
    if (nextBlank) refs.current[nextBlank.index]?.focus();
    else onSubmit();
  };

  return (
    <p className="ex-text-block">
      {exo.segments.map((seg, i) => {
        if (seg.type === "text") {
          return (
            <span key={i} className="ex-text">
              {seg.value}
            </span>
          );
        }
        const status = submitted
          ? detail?.results?.[seg.index]
            ? "correct"
            : "wrong"
          : "";
        return (
          <span key={i} className="ex-blank">
            <input
              ref={(el) => {
                refs.current[seg.index] = el;
              }}
              className={`ex-blank-input ${status}`}
              type="text"
              value={value?.[seg.index] || ""}
              onChange={(e) =>
                onChange({ ...value, [seg.index]: e.target.value })
              }
              onKeyDown={(e) => handleKey(e, seg.index)}
              disabled={submitted}
              placeholder="···"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              style={{ width: `min(${Math.max(seg.answer.length + 2, 5)}ch, 100%)` }}
              aria-label={`Trou ${seg.index + 1}`}
            />
            {status === "wrong" && (
              <span className="ex-blank-fix">{seg.answer}</span>
            )}
          </span>
        );
      })}
    </p>
  );
}

/* ───────────────── Appariement ───────────────── */

function MatchingBody({ exo, value, onChange, submitted, detail }) {
  // value = { [pairId]: frChoisi }
  const usedFr = new Set(Object.values(value || {}));
  const activeId = exo.pairs.find((p) => !value?.[p.id])?.id;
  const frOptions = shuffleStable(exo); // déterministe : ordre stable entre rendus

  const assign = (fr) => {
    if (submitted) return;
    // Retirer une association existante = re-tapper le mot déjà associé
    const owner = Object.keys(value || {}).find((k) => value[k] === fr);
    if (owner) {
      const next = { ...value };
      delete next[owner];
      return onChange(next);
    }
    if (!activeId) return;
    onChange({ ...value, [activeId]: fr });
  };

  return (
    <div className="ex-match">
      <ul className="ex-match-list">
        {exo.pairs.map((pair) => {
          const chosen = value?.[pair.id];
          const status = submitted
            ? detail?.results?.[pair.id]
              ? "correct"
              : "wrong"
            : pair.id === activeId
              ? "active"
              : "";
          return (
            <li key={pair.id} className={`ex-match-row ${status}`}>
              <span className="ex-match-ko ko">{pair.ko}</span>
              <span className="ex-match-slot">
                {chosen || <em>?</em>}
                {submitted && !detail?.results?.[pair.id] && (
                  <span className="ex-blank-fix">{pair.fr}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {!submitted && (
        <div className="ex-match-options">
          {frOptions.map((fr) => (
            <button
              key={fr}
              type="button"
              className={`chip ${usedFr.has(fr) ? "active" : ""}`}
              onClick={() => assign(fr)}
            >
              {fr}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Ordre des propositions figé pour la durée de l'exercice. */
function shuffleStable(exo) {
  const list = exo.pairs.map((p) => p.fr);
  // tri déterministe par hachage du texte : stable entre deux rendus
  return [...list].sort((a, b) => hash(a + exo.id) - hash(b + exo.id));
}

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return h;
}

/* ───────────────── Remise en ordre ───────────────── */

function OrderBody({ exo, value, onChange, submitted }) {
  const chosen = value || [];
  const remaining = countRemaining(exo.tokens, chosen);

  return (
    <div className="ex-order">
      <div className={`ex-order-slot ${submitted ? "done" : ""}`}>
        {chosen.length === 0 ? (
          <span className="ex-order-placeholder">
            Tape les mots dans l'ordre
          </span>
        ) : (
          chosen.map((token, i) => (
            <button
              key={`${token}-${i}`}
              type="button"
              className="ex-token placed"
              onClick={() =>
                !submitted && onChange(chosen.filter((_, j) => j !== i))
              }
              disabled={submitted}
            >
              {token}
            </button>
          ))
        )}
      </div>

      {!submitted && (
        <div className="ex-order-bank">
          {remaining.map((token, i) => (
            <button
              key={`${token}-${i}`}
              type="button"
              className="ex-token"
              onClick={() => onChange([...chosen, token])}
            >
              {token}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Gère les mots répétés : on retire une occurrence par mot placé. */
function countRemaining(tokens, chosen) {
  const pool = [...tokens];
  for (const token of chosen) {
    const at = pool.indexOf(token);
    if (at >= 0) pool.splice(at, 1);
  }
  return pool;
}
