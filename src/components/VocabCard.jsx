const TYPE_COLORS = {
  명사: { bg: "#EEEDFE", color: "#3C3489" },
  동사: { bg: "#E1F5EE", color: "#085041" },
  형용사: { bg: "#FAECE7", color: "#993C1D" },
  부사: { bg: "#FAEEDA", color: "#854F0B" },
};

export default function VocabCard({ groupTitle, words }) {
  return (
    <div className="card">
      <h2>{groupTitle}</h2>
      <table className="vocab-table">
        <thead>
          <tr>
            <th>한글</th>
            <th>Traduction</th>
            <th>Type</th>
            <th>Niveau</th>
            <th>Chapitre</th>
          </tr>
        </thead>
        <tbody>
          {words.map((word, i) => {
            const style = TYPE_COLORS[word.type] || {
              bg: "#F1EFE8",
              color: "#5F5E5A",
            };
            return (
              <tr key={i}>
                <td className="kor">{word.hangul}</td>
                <td className="fr">{word.fr}</td>
                <td>
                  <span
                    className="tag"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {word.type}
                  </span>
                </td>
                <td>{word.level}</td>
                <td>
                  <span className="tag">{word.chapitre}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
