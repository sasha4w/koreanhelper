import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Section from "../components/Section";
import Card from "../components/Card";

export default function Grammaire() {
  const [data, setData] = useState([]);
  const [levelFilter, setLevelFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrammaire = async () => {
      setLoading(true);
      const { data: grammaireData, error } = await supabase
        .from("grammaire")
        .select("*");

      if (error) console.error("Erreur Supabase:", error);
      else setData(grammaireData);
      setLoading(false);
    };
    fetchGrammaire();
  }, []);

  const filtered = data.filter((item) => {
    if (levelFilter === "all") return true;
    return Number(item.level) === Number(levelFilter);
  });

  // Groupement par la colonne 'section'
  const sections = filtered.reduce((acc, item) => {
    const s = item.section || "Général";
    if (!acc[s]) acc[s] = [];
    acc[s].push(item);
    return acc;
  }, {});

  if (loading) return <div className="loader">Chargement...</div>;

  return (
    <>
      <div className="filter-container">
        {["all", 1, 2].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(lvl)}
            className={`filter-btn ${levelFilter === lvl ? "active" : ""}`}
          >
            {lvl === "all" ? "Tout voir" : `Niveau ${lvl}`}
          </button>
        ))}
      </div>

      {Object.keys(sections).map((secTitle) => (
        <Section key={secTitle} title={secTitle} defaultOpen={false}>
          {sections[secTitle].map((card) => (
            <Card
              key={card.id}
              title={card.title}
              tag={card.tag}
              tagColor={card.tag_color} // Mapping snake_case -> camelCase
              formula={card.formula}
              formulaColor={card.formula_color}
              desc={card.description} // Mapping description -> desc
              examples={card.examples} // Déjà un tableau JSONB, donc ça marche direct
              note={card.note}
              noteType={card.note_type}
            />
          ))}
        </Section>
      ))}
    </>
  );
}
