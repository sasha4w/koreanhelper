import { catColors } from "../data/vocabulaireData";

export default function VocabCard({ theme, words }) {
  return (
    <div className="card">
      <h2>{theme}</h2>
      <table className="vocab-table">
        <thead>
          <tr>
            <th>한글</th>
            <th>Traduction</th>
            <th>Catégorie</th>
          </tr>
        </thead>
        <tbody>
          {words.map((word, i) => (
            <tr key={i}>
              <td className="kor">{word.hangul}</td>
              <td className="fr">{word.fr}</td>
              <td>
                <span className={`tag ${catColors[word.cat] || ""}`}>
                  {word.cat}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
