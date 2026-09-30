import { useState } from "react";
import { typeJamo, backspaceJamo } from "../../lib/hangul";
import { CheckCircle } from "../Icon";
import "./HangulKeyboard.css";

const ROW1 = ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"];
const ROW1_SHIFT = ["ㅃ", "ㅉ", "ㄸ", "ㄲ", "ㅆ", null, null, null, "ㅒ", "ㅖ"];
const ROW2 = ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"];
const ROW3 = ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"];

/**
 * Clavier hangul à l'écran, disposition 2-beolsik (standard) : consonnes à
 * gauche, voyelles à droite. Purement contrôlé : ne connaît que `value`
 * (chaîne) et `onChange(nouvelleChaîne)`, même contrat que l'<input> qu'il
 * complète — aucune adaptation nécessaire côté parent.
 */
export default function HangulKeyboard({ value, onChange, onEnter }) {
  const [shift, setShift] = useState(false);
  const text = value || "";

  const tapKey = (jamo) => {
    if (!jamo) return;
    onChange(typeJamo(text, jamo));
    setShift(false); // touche "shift" à relâchement automatique, comme un clavier mobile
  };

  const renderRow = (chars, shifted) =>
    chars.map((ch, idx) => {
      const shown = shift && shifted?.[idx] ? shifted[idx] : ch;
      return (
        <button
          key={ch}
          type="button"
          className="hk-key"
          onClick={() => tapKey(shown)}
        >
          {shown}
        </button>
      );
    });

  return (
    <div className="hangul-keyboard" role="group" aria-label="Clavier hangul">
      <div className="hk-row">{renderRow(ROW1, ROW1_SHIFT)}</div>
      <div className="hk-row">{renderRow(ROW2)}</div>
      <div className="hk-row">
        <button
          type="button"
          className={`hk-key hk-shift ${shift ? "active" : ""}`}
          onClick={() => setShift((s) => !s)}
          aria-pressed={shift}
          aria-label="Consonnes doubles"
        >
          ⇧
        </button>
        {renderRow(ROW3)}
        <button
          type="button"
          className="hk-key hk-backspace"
          onClick={() => onChange(backspaceJamo(text))}
          aria-label="Effacer"
        >
          ⌫
        </button>
      </div>
      <div className="hk-row">
        <button
          type="button"
          className="hk-key hk-space"
          onClick={() => onChange(text + " ")}
          aria-label="Espace"
        >
          espace
        </button>
        {onEnter && (
          <button
            type="button"
            className="hk-key hk-enter"
            onClick={onEnter}
            aria-label="Valider"
          >
            <CheckCircle />
          </button>
        )}
      </div>
    </div>
  );
}
