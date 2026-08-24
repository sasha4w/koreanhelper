import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ExerciseRunner from "../components/ExerciseRunner";
import { useTables } from "../hooks/useTable";
import { getDueEntries, getStats, subscribe } from "../lib/progress";
import { buildSession } from "../lib/exercises/buildSession";
import {
  Book,
  Brain,
  Clock,
  Flame,
  Pencil,
  Play,
  Puzzle,
  ChevronRight,
  Star,
  Target,
  Trophy,
  Wave,
  X,
} from "../components/Icon";
import "./Home.css";

const TABLES = ["vocabulaire", "grammaire", "verbes", "exercices"];
const DAILY_COUNT = 15;
const DUE_VISIBLE = 40;

export default function Home() {
  const { data, loading } = useTables(TABLES);
  const [stats, setStats] = useState(getStats);
  const [session, setSession] = useState(null);
  const [showDue, setShowDue] = useState(false);

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

  // Résout un sourceKey ("vocab:12", "grammaire:3"…) vers un libellé lisible.
  const lookup = useMemo(() => {
    const map = new Map();
    for (const w of data.vocabulaire || [])
      map.set(`vocab:${w.id}`, { label: w.hangul, sub: w.fr, ko: true });
    for (const l of data.grammaire || [])
      map.set(`grammaire:${l.id}`, {
        label: l.title,
        sub: l.description || l.formula,
        ko: true,
      });
    for (const l of data.verbes || [])
      map.set(`verbes:${l.id}`, {
        label: l.title,
        sub: l.description || l.formula,
        ko: true,
      });
    for (const e of data.exercices || [])
      map.set(`exercice:${e.id}`, { label: e.title, sub: e.tag });
    return map;
  }, [data]);

  // `stats` ne sert qu'à déclencher un recalcul : getDueEntries() relit
  // localStorage directement et ne référence pas `stats` lui-même.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dueEntries = useMemo(() => getDueEntries(), [stats]);

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
        <h2>
          Bonjour <Wave />
        </h2>
        <p className="subtitle">Prêt·e pour ta révision du jour ?</p>
      </header>

      <div className="home-stats">
        <Stat value={stats.streak.current} label="jours d'affilée" Icon={Flame} />
        <Stat
          value={stats.due}
          label="à réviser"
          Icon={Clock}
          onClick={() => setShowDue((v) => !v)}
          active={showDue}
        />
        <Stat value={stats.mastered} label="maîtrisés" Icon={Star} />
        <Stat
          value={stats.seen ? `${stats.accuracy}%` : "—"}
          label="de réussite"
          Icon={Target}
        />
      </div>

      {showDue && (
        <div className="home-due-panel">
          <div className="home-due-head">
            <h3>
              <Clock /> Mots à réviser
            </h3>
            <button
              type="button"
              className="home-due-close"
              onClick={() => setShowDue(false)}
              aria-label="Fermer"
            >
              <X />
            </button>
          </div>

          {dueEntries.length === 0 ? (
            <p className="empty-state">Rien à réviser pour l'instant, bravo !</p>
          ) : (
            <>
              <ul className="home-due-list">
                {dueEntries.slice(0, DUE_VISIBLE).map(({ key }) => {
                  const info = lookup.get(key);
                  if (!info) return null;
                  return (
                    <li key={key} className="home-due-row">
                      <span className={info.ko ? "home-due-label ko" : "home-due-label"}>
                        {info.label}
                      </span>
                      {info.sub && (
                        <span className="home-due-sub">{info.sub}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {dueEntries.length > DUE_VISIBLE && (
                <p className="home-due-more">
                  +{dueEntries.length - DUE_VISIBLE} autres
                </p>
              )}
              <Link to="/entrainement" className="btn secondary block">
                Réviser maintenant
              </Link>
            </>
          )}
        </div>
      )}

      <button
        className="btn gradient block home-cta"
        onClick={() => setSession(daily)}
        disabled={loading || daily.length === 0}
      >
        {loading ? (
          "Chargement…"
        ) : daily.length === 0 ? (
          "Aucun exercice disponible"
        ) : (
          <>
            <Play /> Session du jour ({daily.length} exercices)
          </>
        )}
      </button>

      {stats.today && (
        <p className="home-today">
          Aujourd'hui : {stats.today.score}/{stats.today.count}
          {stats.today.count >= DAILY_COUNT ? (
            <span className="home-today-done">
              <Trophy /> objectif atteint
            </span>
          ) : (
            " — continue !"
          )}
        </p>
      )}

      <nav className="home-links">
        <HomeLink to="/entrainement" Icon={Target} title="S'entraîner">
          Choisir un thème, un niveau et un type d'exercice
        </HomeLink>
        <HomeLink to="/vocabulaire" Icon={Book} title="Vocabulaire">
          {wordCount ? `${wordCount} mots à parcourir` : "Parcourir les mots"}
        </HomeLink>
        <HomeLink to="/cours?type=grammaire" Icon={Puzzle} title="Grammaire">
          Particules, structures et règles
        </HomeLink>
        <HomeLink
          to="/cours?type=verbes"
          Icon={Book}
          title="Terminaisons verbales"
        >
          Conjugaisons, politesse et temps
        </HomeLink>
        <HomeLink to="/quiz" Icon={Brain} title="Quiz par chapitre">
          Réviser un chapitre précis
        </HomeLink>
        <HomeLink to="/exo" Icon={Pencil} title="Exercices rédigés">
          Les exercices écrits à la main
        </HomeLink>
      </nav>
    </div>
  );
}

function Stat(props) {
  // Déstructuré ici, pas dans la signature : un paramètre destructuré
  // utilisé seulement comme balise JSX échappe à l'analyse d'ESLint.
  const { value, label, Icon, onClick, active } = props;
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={`home-stat ${onClick ? "clickable" : ""} ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="home-stat-icon">
        <Icon />
      </span>
      <span className="home-stat-value">{value}</span>
      <span className="home-stat-label">{label}</span>
    </Tag>
  );
}

function HomeLink(props) {
  const { to, Icon, title, children } = props;
  return (
    <Link to={to} className="home-link">
      <span className="home-link-icon">
        <Icon />
      </span>
      <span className="home-link-text">
        <strong>{title}</strong>
        <span>{children}</span>
      </span>
      <span className="home-link-arrow">
        <ChevronRight />
      </span>
    </Link>
  );
}
