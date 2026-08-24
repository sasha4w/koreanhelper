import { useMemo, useState } from "react";
import ExerciseRunner from "../components/ExerciseRunner";
import ChipList from "../components/ChipList";
import { Pencil, Bulb } from "../components/Icon";
import { useTable } from "../hooks/useTable";
import { deriveLevels } from "../lib/levels";
import { fromDbRows } from "../lib/exercises/fromDb";
import { makeRng } from "../lib/exercises/rng";
import {
  DEFAULT_KIND_ICON,
  KIND_ICONS,
  KIND_LABELS,
} from "../lib/constants";
import "./Exo.css";

export default function Exo() {
  const { data: rows, loading, error } = useTable("exercices");
  const [level, setLevel] = useState(null);
  const [tag, setTag] = useState("Tous");
  const [session, setSession] = useState(null);

  const all = useMemo(() => fromDbRows(rows), [rows]);
  const levels = useMemo(() => deriveLevels(rows), [rows]);
  const activeLevel = level ?? levels[0] ?? "all";

  const byLevel = useMemo(
    () => all.filter((e) => String(e.level) === String(activeLevel)),
    [all, activeLevel],
  );

  const tags = useMemo(
    () => ["Tous", ...new Set(byLevel.map((e) => e.tag).filter(Boolean))],
    [byLevel],
  );

  const visible = useMemo(
    () => (tag === "Tous" ? byLevel : byLevel.filter((e) => e.tag === tag)),
    [byLevel, tag],
  );

  if (loading) return <div className="loader">Chargement…</div>;
  if (error)
    return <p className="empty-state">Impossible de charger les exercices.</p>;

  if (session) {
    return (
      <ExerciseRunner
        key={session[0]?.id + session.length}
        exercises={session}
        onQuit={() => setSession(null)}
        onRestart={(pool) => setSession([...pool])}
      />
    );
  }

  return (
    <div className="stack loose">
      <header className="exo-hero">
        <span className="exo-hero-icon">
          <Pencil />
        </span>
        <h2>Exercices</h2>
        <p className="subtitle">
          Les exercices rédigés à la main, classés par point de grammaire.
        </p>
      </header>

      {levels.length > 1 && (
        <ChipList
          options={levels.map((l) => ({ value: l, label: `Niveau ${l}` }))}
          value={activeLevel}
          onChange={(l) => {
            setLevel(l);
            setTag("Tous");
          }}
        />
      )}

      {tags.length > 1 && (
        <ChipList
          options={tags.map((t) => ({ value: t, label: t }))}
          value={tag}
          onChange={setTag}
          variant="accent"
        />
      )}

      {visible.length === 0 ? (
        <p className="empty-state">Aucun exercice pour cette sélection.</p>
      ) : (
        <>
          <button
            className="btn gradient block"
            onClick={() => setSession(makeRng().shuffle(visible))}
          >
            Tout faire ({visible.length} exercices)
          </button>

          <div className="exo-list">
            {visible.map((exo) => {
              const KindIcon = KIND_ICONS[exo.kind] || DEFAULT_KIND_ICON;
              return (
                <button
                  key={exo.id}
                  className="exo-item"
                  onClick={() => setSession([exo])}
                >
                  <span className="exo-item-top">
                    <span className="exo-item-type">
                      <KindIcon /> {KIND_LABELS[exo.kind]}
                    </span>
                    {exo.tag && <span className="tag">{exo.tag}</span>}
                  </span>
                  <span className="exo-item-title">{exo.prompt}</span>
                  {exo.hint && (
                    <span className="exo-item-hint">
                      <Bulb /> {exo.hint}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
