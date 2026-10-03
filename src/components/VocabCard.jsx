import { typeStyle } from "../lib/constants";
import { getWordMasteryTier } from "../lib/mastery";
import { getState } from "../lib/progress";
import { useLang } from "../lib/i18n/LangProvider";
import SpeakButton from "./SpeakButton";
import "./VocabCard.css";

const MASTERY_LABELS = {
  fr: { new: "Nouveau", learning: "En cours", almost: "Presque acquis", mastered: "Maîtrisé" },
  en: { new: "New", learning: "Learning", almost: "Almost mastered", mastered: "Mastered" },
};

export default function VocabCard({ words }) {
  // Un seul getState() pour tous les mots plutôt qu'un par carte.
  const state = getState();
  const { lang } = useLang();

  return (
    <div className="vocab-grid">
      {words.map((word) => {
        const style = typeStyle(word.type);
        const tier = getWordMasteryTier(word.id, state);
        const translation = lang === "en" && word.en ? word.en : word.fr;
        return (
          <div
            key={word.id}
            className={`vocab-word-card mastery-${tier}`}
            title={MASTERY_LABELS[lang][tier]}
          >
            <span className="vocab-hangul-row">
              <span className="vocab-hangul">{word.hangul}</span>
              <SpeakButton text={word.hangul} />
            </span>
            <span className={`vocab-${lang}`}>{translation}</span>
            {word.type && (
              <span
                className="tag"
                style={{ background: style.bg, color: style.color }}
              >
                {word.type}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
