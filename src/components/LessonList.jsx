import { useMemo, useState } from "react";
import Section from "./Section";
import Card from "./Card";
import SearchBar from "./SearchBar";
import { useTable } from "../hooks/useTable";
import { levelOptions, matchesLevel } from "../lib/levels";
import { normalizeFr } from "../lib/normalize";

/**
 * Liste de cours repliables. `verbes` et `grammaire` partagent exactement
 * la même structure : une seule implémentation paramétrée par la table.
 */
export default function LessonList({ table, placeholder }) {
  const { data, loading, error } = useTable(table);
  const [level, setLevel] = useState("all");
  const [search, setSearch] = useState("");

  const options = useMemo(() => levelOptions(data), [data]);

  const filtered = useMemo(() => {
    const needle = normalizeFr(search);
    const raw = search.trim();

    return data.filter((item) => {
      if (!matchesLevel(item, level)) return false;
      if (!needle) return true;

      // On cherche dans le titre, la formule, la description, les notes,
      // les tags ET les exemples : c'est là que vivent les formes coréennes.
      const haystack = [
        item.title,
        item.formula,
        item.description,
        item.note,
        item.tag,
        item.section,
        ...(Array.isArray(item.examples)
          ? item.examples.flatMap((ex) => [ex?.kor, ex?.fr])
          : []),
      ]
        .filter(Boolean)
        .join(" ");

      return (
        normalizeFr(haystack).includes(needle) || haystack.includes(raw)
      );
    });
  }, [data, level, search]);

  const sections = useMemo(() => {
    const groups = new Map();
    for (const item of filtered) {
      const key = item.section || "Général";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    return [...groups.entries()];
  }, [filtered]);

  const searching = Boolean(search.trim());

  if (loading) return <div className="loader">Chargement…</div>;
  if (error)
    return <p className="empty-state">Impossible de charger les cours.</p>;

  return (
    <div className="stack">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={placeholder || "Chercher une règle, une forme, un exemple"}
      />

      {options.length > 2 && (
        <div className="scroll-x">
          {options.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLevel(value)}
              className={`chip ${level === value ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {searching && (
        <p className="lesson-count">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </p>
      )}

      {sections.length === 0 ? (
        <p className="empty-state">
          {searching
            ? "Aucun résultat pour cette recherche."
            : "Aucun contenu pour ce niveau."}
        </p>
      ) : (
        sections.map(([title, items]) => (
          <Section
            /* La `key` inclut l'état de recherche : entrer ou sortir du mode
               recherche remonte les sections, qui s'ouvrent alors d'office. */
            key={`${title}:${searching}`}
            title={title}
            count={items.length}
            defaultOpen={searching}
          >
            {items.map((card) => (
              <Card
                key={card.id}
                title={card.title}
                tag={card.tag}
                tagColor={card.tag_color}
                formula={card.formula}
                formulaColor={card.formula_color}
                desc={card.description}
                examples={card.examples}
                note={card.note}
                noteType={card.note_type}
              />
            ))}
          </Section>
        ))
      )}
    </div>
  );
}
