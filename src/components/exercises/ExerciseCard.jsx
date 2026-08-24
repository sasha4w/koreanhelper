import { useEffect, useRef, useState } from "react";
import { BLANK_KINDS, CHOICE_KINDS } from "../../lib/exercises/check";
import { useAutoWidth } from "../../hooks/useAutoWidth";
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
  const text = value || "";
  const placeholder = exo.lang === "ko" ? "한글..." : "Ta réponse...";
  // `extra` couvre le padding + la bordure de .ex-input (box-sizing: border-box) :
  // sans cette marge, la zone de texte réelle serait plus étroite que le texte mesuré.
  const { width, mirrorRef } = useAutoWidth(text || placeholder, {
    min: 120,
    extra: 44,
  });

  useEffect(() => {
    if (!submitted) ref.current?.focus();
  }, [exo.id, submitted]);

  return (
    <>
      <p className="ex-question">{exo.question}</p>
      <span
        ref={mirrorRef}
        className={`ex-input-mirror ${exo.lang === "ko" ? "ko" : ""}`}
        aria-hidden="true"
      >
        {text || placeholder}
      </span>
      <input
        ref={ref}
        className="ex-input auto"
        type="text"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        disabled={submitted}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        lang={exo.lang === "ko" ? "ko" : "fr"}
        aria-label="Ta réponse"
        style={{ width }}
      />
    </>
  );
}

/* ───────────────── QCM ───────────────── */

function ChoiceBody({ exo, value, onChange, submitted }) {
  // "Reconnaître la règle" : la forme correcte est révélée juste au-dessus
  // de la description dès la correction, plutôt qu'en bas de carte.
  const revealForm = submitted && exo.kind === "grammar-qcm";

  return (
    <>
      {revealForm && <p className="ex-answer-form ko">{exo.expected}</p>}

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
          <BlankToken
            key={i}
            seg={seg}
            value={value?.[seg.index] || ""}
            status={status}
            submitted={submitted}
            registerRef={(el) => {
              refs.current[seg.index] = el;
            }}
            onChange={(v) => onChange({ ...value, [seg.index]: v })}
            onKeyDown={(e) => handleKey(e, seg.index)}
          />
        );
      })}
    </p>
  );
}

function BlankToken({ seg, value, status, submitted, registerRef, onChange, onKeyDown }) {
  const { width, mirrorRef } = useAutoWidth(value || "···", {
    min: Math.max(seg.answer.length, 2) * 15 + 24,
  });

  return (
    <span className="ex-blank">
      <span ref={mirrorRef} className="ex-input-mirror ko" aria-hidden="true">
        {value || "···"}
      </span>
      <input
        ref={registerRef}
        className={`ex-blank-input ${status}`}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={submitted}
        placeholder="···"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={{ width }}
        aria-label={`Trou ${seg.index + 1}`}
      />
      {status === "wrong" && <span className="ex-blank-fix">{seg.answer}</span>}
    </span>
  );
}

/* ───────────────── Appariement ───────────────── */

function MatchingBody({ exo, value, onChange, submitted, detail }) {
  // value = { [pairId]: frChoisi }
  const [selectedId, setSelectedId] = useState(
    () => exo.pairs.find((p) => !value?.[p.id])?.id ?? exo.pairs[0]?.id,
  );
  const frOptions = shuffleStable(exo); // déterministe : ordre stable entre rendus

  const selectRow = (id) => {
    if (!submitted) setSelectedId(id);
  };

  // Toggle libre : taper un mot déjà placé le libère, où qu'il soit ;
  // taper un mot libre l'assigne à la ligne actuellement ciblée.
  const assign = (fr) => {
    if (submitted) return;
    const owner = Object.keys(value || {}).find((k) => value[k] === fr);
    if (owner) {
      const next = { ...value };
      delete next[owner];
      onChange(next);
      return;
    }
    if (selectedId == null) return;
    onChange({ ...value, [selectedId]: fr });
    const nextEmpty = exo.pairs.find(
      (p) => p.id !== selectedId && !value?.[p.id],
    );
    if (nextEmpty) setSelectedId(nextEmpty.id);
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
            : pair.id === selectedId
              ? "active"
              : "";
          return (
            <li key={pair.id} className={`ex-match-row ${status}`}>
              <button
                type="button"
                className="ex-match-row-btn"
                onClick={() => selectRow(pair.id)}
                disabled={submitted}
              >
                <span className="ex-match-ko ko">{pair.ko}</span>
                <span className="ex-match-slot">{chosen || <em>?</em>}</span>
              </button>
              {submitted && !detail?.results?.[pair.id] && (
                <span className="ex-blank-fix ex-match-fix">{pair.fr}</span>
              )}
            </li>
          );
        })}
      </ul>

      {!submitted && (
        <div className="ex-match-options">
          {frOptions.map((fr) => {
            const used = Object.values(value || {}).includes(fr);
            return (
              <button
                key={fr}
                type="button"
                className={`chip ${used ? "active" : ""}`}
                onClick={() => assign(fr)}
              >
                {fr}
              </button>
            );
          })}
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
