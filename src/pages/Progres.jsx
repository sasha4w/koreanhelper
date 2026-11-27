import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTables } from "../hooks/useTable";
import { useAuth } from "../lib/auth/AuthProvider";
import { getState, getStats, subscribe } from "../lib/progress";
import {
  TIERS,
  activityGrid,
  badges,
  byTheme,
  distribution,
  forecast,
  intensity,
  lastDays,
  levelOf,
  masteryScore,
  weakest,
  xpOf,
} from "../lib/dashboard";
import {
  BarChart,
  Calendar,
  Clock,
  Cloud,
  Flame,
  Star,
  Target,
  Trophy,
  Zap,
} from "../components/Icon";
import "./Progres.css";

const TABLES = ["vocabulaire", "grammaire", "verbes"];
const DAILY_GOAL = 15;
const THEMES_VISIBLE = 8;

const TIER_LABELS = {
  new: "Nouveau",
  learning: "En cours",
  almost: "Presque acquis",
  mastered: "Maîtrisé",
};

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

const themeLabel = (t) =>
  t.replace(/_/g, " / ").replace(/^./, (c) => c.toUpperCase());

const fmtDay = (day) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export default function Progres() {
  const { data, loading } = useTables(TABLES);
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const [allThemes, setAllThemes] = useState(false);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  // `tick` force la relecture de l'état après chaque réponse / synchro.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const state = useMemo(() => getState(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => getStats(), [tick]);
  const items = state.items;

  const vocab = data.vocabulaire;
  const lessons = useMemo(
    () => [
      ...(data.grammaire || []).map((l) => ({ ...l, key: `grammaire:${l.id}` })),
      ...(data.verbes || []).map((l) => ({ ...l, key: `verbes:${l.id}` })),
    ],
    [data.grammaire, data.verbes],
  );

  const vocabKeys = useMemo(() => (vocab || []).map((w) => `vocab:${w.id}`), [vocab]);
  const lessonKeys = useMemo(() => lessons.map((l) => l.key), [lessons]);
  const lookup = useMemo(() => {
    const map = new Map();
    for (const w of vocab || []) map.set(`vocab:${w.id}`, { label: w.hangul, sub: w.fr });
    for (const l of lessons) map.set(l.key, { label: l.title, sub: l.tag || l.section });
    return map;
  }, [vocab, lessons]);

  const level = levelOf(xpOf(state));
  const vocabDist = distribution(vocabKeys, items);
  const lessonDist = distribution(lessonKeys, items);
  const vocabScore = masteryScore(vocabKeys, items);
  const lessonScore = masteryScore(lessonKeys, items);
  const grid = activityGrid(state.history);
  const days = lastDays(state.history);
  const due = forecast(items);
  const themes = useMemo(() => byTheme(vocab, items), [vocab, items]);
  const weakWords = weakest(items, "vocab:");
  const weakLessons = [...weakest(items, "grammaire:", 4), ...weakest(items, "verbes:", 4)]
    .sort((a, b) => b.failRate - a.failRate)
    .slice(0, 6);
  const earned = badges(state, { vocabTotal: vocabKeys.length });
  const todayCount = stats.today?.count || 0;

  if (loading) return <div className="loader">Chargement…</div>;

  return (
    <div className="stack loose progres">
      {/* ── En-tête : niveau et XP ── */}
      <section className="pg-hero">
        <div className="pg-hero-level">
          <Ring pct={level.pct} size={108} stroke={10} tone="light">
            <span className="pg-level-num">{level.level}</span>
            <span className="pg-level-cap">niveau</span>
          </Ring>
        </div>
        <div className="pg-hero-text">
          <h2>Ta progression</h2>
          <p className="pg-xp">
            <Zap /> <strong>{level.xp.toLocaleString("fr-FR")}</strong> XP
          </p>
          <div className="pg-xp-bar" aria-label={`${level.pct} % vers le niveau ${level.level + 1}`}>
            <span style={{ "--w": `${level.pct}%` }} />
          </div>
          <p className="pg-xp-next">
            Encore {(level.span - level.into).toLocaleString("fr-FR")} XP avant le niveau {level.level + 1}
          </p>
        </div>
        {!user && (
          <Link to="/compte" className="pg-hero-sync">
            <Cloud /> Connecte-toi pour sauvegarder
          </Link>
        )}
      </section>

      {/* ── Tuiles clés ── */}
      <section className="pg-kpis">
        <Kpi Icon={Flame} tone="rose" value={stats.streak.current} label="jours d'affilée" sub={`record : ${stats.streak.best || 0}`} />
        <div className="pg-kpi">
          <Ring pct={Math.min(100, Math.round((todayCount / DAILY_GOAL) * 100))} size={56} stroke={6}>
            <Target />
          </Ring>
          <span className="pg-kpi-value">
            {todayCount}
            <small>/{DAILY_GOAL}</small>
          </span>
          <span className="pg-kpi-label">exercices aujourd'hui</span>
        </div>
        <Kpi Icon={Star} tone="amber" value={stats.seen ? `${stats.accuracy} %` : "—"} label="de réussite" />
        <Kpi Icon={Clock} tone="teal" value={due.now} label="à réviser" sub={`demain : ${due.tomorrow}`} />
      </section>

      {/* ── Maîtrise ── */}
      <section className="pg-card">
        <h3>
          <BarChart /> Maîtrise
        </h3>
        <MasteryRow title="Vocabulaire" score={vocabScore} dist={vocabDist} total={vocabKeys.length} />
        <MasteryRow title="Grammaire & terminaisons" score={lessonScore} dist={lessonDist} total={lessonKeys.length} />
        <ul className="pg-legend">
          {TIERS.map((t) => (
            <li key={t}>
              <span className={`pg-dot tier-${t}`} /> {TIER_LABELS[t]}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Activité ── */}
      <section className="pg-card">
        <h3>
          <Calendar /> Activité
        </h3>
        <div className="pg-heatmap-wrap">
          <div className="pg-weekdays" aria-hidden="true">
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{i % 2 === 0 ? d : ""}</span>
            ))}
          </div>
          <div className="pg-heatmap" role="img" aria-label="Exercices par jour sur les 15 dernières semaines">
            {grid.cells.map((c, i) => (
              <span
                key={c.day}
                className={`pg-cell lv-${c.future ? "x" : intensity(c.count, grid.max)}`}
                style={{ "--i": i }}
                data-tip={c.future ? undefined : `${fmtDay(c.day)} : ${c.count ? `${c.count} exercices, ${c.score} justes` : "aucun exercice"}`}
              />
            ))}
          </div>
        </div>
        <div className="pg-scale" aria-hidden="true">
          moins
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`pg-cell lv-${l}`} />
          ))}
          plus
        </div>

        <h4>14 derniers jours</h4>
        <Bars days={days} />
      </section>

      {/* ── Révisions à venir ── */}
      <section className="pg-forecast">
        <Forecast label="Maintenant" value={due.now} tone="now" />
        <Forecast label="D'ici demain" value={due.tomorrow} tone="soon" />
        <Forecast label="Cette semaine" value={due.week} tone="later" />
      </section>

      {/* ── Thèmes ── */}
      <section className="pg-card">
        <h3>
          <Star /> Par thème
        </h3>
        <ul className="pg-themes">
          {(allThemes ? themes : themes.slice(0, THEMES_VISIBLE)).map((t, i) => (
            <li key={t.theme}>
              <Link to={`/entrainement?theme=${encodeURIComponent(t.theme)}`} className="pg-theme">
                <span className="pg-theme-name">{themeLabel(t.theme)}</span>
                <span className="pg-theme-track">
                  <span style={{ "--w": `${t.score}%`, "--d": `${i * 40}ms` }} />
                </span>
                <span className="pg-theme-num">
                  {t.mastered}/{t.total}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {themes.length > THEMES_VISIBLE && (
          <button type="button" className="btn ghost block pg-more" onClick={() => setAllThemes((v) => !v)}>
            {allThemes ? "Réduire" : `Voir les ${themes.length} thèmes`}
          </button>
        )}
        <p className="pg-note">Barre : maîtrise moyenne du thème · chiffre : mots maîtrisés / total. Clique pour t'entraîner.</p>
      </section>

      {/* ── Points faibles ── */}
      <section className="pg-two">
        <WeakList title="Mots à retravailler" list={weakWords} lookup={lookup} ko />
        <WeakList title="Grammaire à retravailler" list={weakLessons} lookup={lookup} ko />
      </section>

      {/* ── Badges ── */}
      <section className="pg-card">
        <h3>
          <Trophy /> Badges <small>{earned.filter((b) => b.got).length}/{earned.length}</small>
        </h3>
        <ul className="pg-badges">
          {earned.map((b) => (
            <li key={b.id} className={b.got ? "got" : "locked"} data-tip={b.hint}>
              <span className="pg-badge-icon">
                <Trophy />
              </span>
              <span className="pg-badge-label">{b.label}</span>
              <span className="pg-badge-hint">{b.hint}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ───────────────── Composants ───────────────── */

function Ring({ pct, size = 64, stroke = 8, tone, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className={`pg-ring ${tone || ""}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="pg-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className="pg-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          style={{ "--c": c, "--off": c * (1 - pct / 100) }}
        />
      </svg>
      <span className="pg-ring-inner">{children}</span>
    </span>
  );
}

function Kpi(props) {
  const { Icon, tone, value, label, sub } = props;
  return (
    <div className="pg-kpi">
      <span className={`pg-kpi-icon tone-${tone}`}>
        <Icon />
      </span>
      <span className="pg-kpi-value">{value}</span>
      <span className="pg-kpi-label">{label}</span>
      {sub && <span className="pg-kpi-sub">{sub}</span>}
    </div>
  );
}

function MasteryRow({ title, score, dist, total }) {
  return (
    <div className="pg-mastery">
      <div className="pg-mastery-head">
        <strong>{title}</strong>
        <span className="pg-mastery-score">{score} %</span>
      </div>
      <div className="pg-stack" role="img" aria-label={TIERS.map((t) => `${TIER_LABELS[t]} ${dist[t]}`).join(", ")}>
        {TIERS.map((t) =>
          dist[t] ? (
            <span
              key={t}
              className={`tier-${t}`}
              style={{ flexGrow: dist[t] }}
              data-tip={`${TIER_LABELS[t]} : ${dist[t]} / ${total}`}
            />
          ) : null,
        )}
      </div>
      <div className="pg-mastery-counts">
        {TIERS.map((t) => (
          <span key={t}>
            <span className={`pg-dot tier-${t}`} /> {dist[t]}
          </span>
        ))}
      </div>
    </div>
  );
}

function Bars({ days }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="pg-bars" role="img" aria-label="Exercices par jour, 14 derniers jours">
      {days.map((d, i) => (
        <div
          key={d.day}
          className="pg-bar"
          data-tip={`${fmtDay(d.day)} : ${d.count} exercices${d.count ? `, ${Math.round((d.score / d.count) * 100)} % justes` : ""}`}
        >
          <span className="pg-bar-col">
            <span
              className={d.count ? "" : "empty"}
              style={{ "--h": `${(d.count / max) * 100}%`, "--d": `${i * 30}ms` }}
            />
          </span>
          <span className="pg-bar-day">{new Date(`${d.day}T12:00:00Z`).getUTCDate()}</span>
        </div>
      ))}
    </div>
  );
}

function Forecast({ label, value, tone }) {
  return (
    <div className={`pg-fc ${tone}`}>
      <span className="pg-fc-value">{value}</span>
      <span className="pg-fc-label">{label}</span>
    </div>
  );
}

function WeakList({ title, list, lookup, ko }) {
  return (
    <div className="pg-card">
      <h3>{title}</h3>
      {list.length === 0 ? (
        <p className="pg-note">Rien à signaler pour l'instant.</p>
      ) : (
        <ul className="pg-weak">
          {list.map(({ key, failRate }) => {
            const info = lookup.get(key);
            if (!info) return null;
            return (
              <li key={key}>
                <span className={ko ? "ko" : ""}>{info.label}</span>
                <span className="pg-weak-sub">{info.sub}</span>
                <span className="pg-weak-rate" data-tip="Part de réponses fausses">
                  {Math.round(failRate * 100)} %
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <Link to="/entrainement" className="btn secondary block">
        Réviser
      </Link>
    </div>
  );
}
