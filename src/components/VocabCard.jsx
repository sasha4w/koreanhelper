import "./VocabCard.css";

const TYPE_COLORS = {
  명사: { bg: "#EEEDFE", color: "#3C3489" },
  동사: { bg: "#E1F5EE", color: "#085041" },
  형용사: { bg: "#FAECE7", color: "#993C1D" },
  부사: { bg: "#FAEEDA", color: "#854F0B" },
  expression: { bg: "#FDE8F5", color: "#7B1F6A" },
  의존명사: { bg: "#E8F0FD", color: "#1A3A8A" },
  관형사: { bg: "#FDF3E8", color: "#8A4A1A" },
  대명사: { bg: "#E8FDF3", color: "#1A6A4A" },
  접속사: { bg: "#F3E8FD", color: "#5A1A8A" },
  조사: { bg: "#FDE8E8", color: "#8A1A1A" },
};

export default function VocabCard({ words }) {
  return (
    <div className="vocab-grid">
      {words.map((word, i) => {
        const style = TYPE_COLORS[word.type] || {
          bg: "#F1EFE8",
          color: "#5F5E5A",
        };
        return (
          <div key={i} className="vocab-word-card">
            <span className="vocab-hangul">{word.hangul}</span>
            <span className="vocab-fr">{word.fr}</span>
            <span
              className="tag"
              style={{ background: style.bg, color: style.color }}
            >
              {word.type}
            </span>
          </div>
        );
      })}
    </div>
  );
}
