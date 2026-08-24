import { useSearchParams } from "react-router-dom";
import LessonList from "../components/LessonList";

const TABS = [
  {
    value: "grammaire",
    label: "🧩 Grammaire",
    table: "grammaire",
    placeholder: "Chercher une particule, une règle…",
  },
  {
    value: "verbes",
    label: "🔤 Terminaisons",
    table: "verbes",
    placeholder: "Chercher une terminaison, un temps…",
  },
];

export default function Cours() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("type");
  const type = TABS.some((t) => t.value === requested) ? requested : "grammaire";
  const active = TABS.find((t) => t.value === type);

  return (
    <div className="stack">
      <div className="segmented-row">
        <div className="segmented">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={type === tab.value ? "active" : ""}
              onClick={() => setParams({ type: tab.value }, { replace: true })}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <LessonList
        key={active.table}
        table={active.table}
        placeholder={active.placeholder}
      />
    </div>
  );
}
