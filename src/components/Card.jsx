export default function Card({
  title,
  tag,
  tagColor,
  formula,
  formulaColor,
  desc,
  examples,
  note,
  noteType,
  twoCol,
}) {
  return (
    <div className="card">
      <h2>{title}</h2>

      {tag && <span className={`tag ${tagColor || "purple"}`}>{tag}</span>}

      {formula && (
        <div className={`formula ${formulaColor || "purple"}`}>{formula}</div>
      )}

      {desc && <p className="desc">{desc}</p>}

      {twoCol && (
        <div className="two-col">
          <div className={`col-box ${twoCol.left.color || ""}`}>
            <h4>{twoCol.left.title}</h4>
            {twoCol.left.items.map((item, i) => (
              <p key={i}>
                <span className="kor">{item.kor}</span>
                {item.fr && (
                  <>
                    {" "}
                    — <span className="fr">{item.fr}</span>
                  </>
                )}
              </p>
            ))}
          </div>
          <div className={`col-box ${twoCol.right.color || ""}`}>
            <h4>{twoCol.right.title}</h4>
            {twoCol.right.items.map((item, i) => (
              <p key={i}>
                <span className="kor">{item.kor}</span>
                {item.fr && (
                  <>
                    {" "}
                    — <span className="fr">{item.fr}</span>
                  </>
                )}
              </p>
            ))}
          </div>
        </div>
      )}

      {examples && (
        <div className="examples">
          {examples.map((ex, i) => (
            <p key={i}>
              <span className="kor">{ex.kor}</span> —{" "}
              <span className="fr">{ex.fr}</span>
            </p>
          ))}
        </div>
      )}

      {note && <div className={`note ${noteType || "tip"}`}>{note}</div>}
    </div>
  );
}
