import { typeStyle } from "../lib/constants";
import "./VocabCard.css";

export default function VocabCard({ words }) {
  return (
    <div className="vocab-grid">
      {words.map((word) => {
        const style = typeStyle(word.type);
        return (
          <div key={word.id} className="vocab-word-card">
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
