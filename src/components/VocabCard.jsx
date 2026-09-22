import { typeStyle } from "../lib/constants";
import { getWordMasteryTier } from "../lib/mastery";
import { getState } from "../lib/progress";
import "./VocabCard.css";

export default function VocabCard({ words }) {
  // Un seul getState() pour tous les mots plutôt qu'un par carte.
  const state = getState();

  return (
    <div className="vocab-grid">
      {words.map((word) => {
        const style = typeStyle(word.type);
        const tier = getWordMasteryTier(word.id, state);
        return (
          <div
            key={word.id}
            className={`vocab-word-card mastery-${tier}`}
            title={
              {
                new: "Nouveau",
                learning: "En cours",
                almost: "Presque acquis",
                mastered: "Maîtrisé",
              }[tier]
            }
          >
            <span className="vocab-hangul">{word.hangul}</span>
            <span className="vocab-fr">{word.fr}</span>
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
