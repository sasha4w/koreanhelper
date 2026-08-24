import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ExerciseRunner from "../components/ExerciseRunner";
import { useTables } from "../hooks/useTable";
import { getStats, subscribe } from "../lib/progress";
import { buildSession } from "../lib/exercises/buildSession";
import "./Home.css";

const TABLES = ["vocabulaire", "grammaire", "verbes", "exercices"];
const DAILY_COUNT = 15;

export default function Home() {
  const { data, loading } = useTables(TABLES);
  const [stats, setStats] = useState(getStats);
  const [session, setSession] = useState(null);

  useEffect(() => subscribe(() => setStats(getStats())), []);

  const daily = useMemo(() => {
    if (loading) return [];
    return buildSession({
      vocab: data.vocabulaire,
      grammaire: data.grammaire,
      verbes: data.verbes,
      dbExercices: data.exercices,
      count: DAILY_COUNT,
    });
  }, [loading, data]);

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

  const wordCount = data.vocabulaire?.length || 0;

  return (
    <div className="stack loose">
      <header className="home-hero">
        <h2>안녕하세요 👋</h2>
        <p className="subtitle">Prêt·e pour ta révision du jour ?</p>
      </header>

      <div className="home-stats">
        <Stat value={stats.streak.current} label="jours d'affilée" icon="🔥" />
        <Stat value={stats.due} label="à réviser" icon="⏰" />
        <Stat value={stats.mastered} label="maîtrisés" icon="⭐" />
        <Stat
          value={stats.seen ? `${stats.accuracy}%` : "—"}
          label="de réussite"
          icon="🎯"
        />
      </div>

      <button
        className="btn gradient block home-cta"
        onClick={() => setSession(daily)}
        disabled={loading || daily.length === 0}
      >
        {loading
          ? "Chargement…"
          : daily.length === 0
            ? "Aucun exercice disponible"
            : `▶ Session du jour (${daily.length} exercices)`}
      </button>

      {stats.today && (
        <p className="home-today">
          Aujourd'hui : {stats.today.score}/{stats.today.count} —{" "}
          {stats.today.count >= DAILY_COUNT ? "objectif atteint 🎉" : "continue !"}
        </p>
      )}

      <nav className="home-links">
        <HomeLink to="/entrainement" icon="🎯" title="S'entraîner">
          Choisir un thème, un niveau et un type d'exercice
        </HomeLink>
        <HomeLink to="/vocabulaire" icon="📖" title="Vocabulaire">
          {wordCount ? `${wordCount} mots à parcourir` : "Parcourir les mots"}
        </HomeLink>
        <HomeLink to="/cours?type=grammaire" icon="🧩" title="Grammaire">
          Particules, structures et règles
        </HomeLink>
        <HomeLink to="/cours?type=verbes" icon="🔤" title="Terminaisons verbales">
          Conjugaisons, politesse et temps
        </HomeLink>
        <HomeLink to="/quiz" icon="🧠" title="Quiz par chapitre">
          Réviser un chapitre précis
        </HomeLink>
        <HomeLink to="/exo" icon="✏️" title="Exercices rédigés">
          Les exercices écrits à la main
        </HomeLink>
      </nav>
    </div>
  );
}

function Stat({ value, label, icon }) {
  return (
    <div className="home-stat">
      <span className="home-stat-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="home-stat-value">{value}</span>
      <span className="home-stat-label">{label}</span>
    </div>
  );
}

function HomeLink({ to, icon, title, children }) {
  return (
    <Link to={to} className="home-link">
      <span className="home-link-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="home-link-text">
        <strong>{title}</strong>
        <span>{children}</span>
      </span>
      <span className="home-link-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
