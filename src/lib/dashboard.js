import { BOX_INTERVALS_DAYS, MAX_BOX, isDue } from "./progress";

/**
 * Calculs du tableau de bord « Progrès », sans dépendance à React :
 * tout part de l'état de progression (progress.js) et des tables chargées.
 */

const DAY = 24 * 60 * 60 * 1000;
const dayKey = (ts) => new Date(ts).toISOString().slice(0, 10);

export const TIERS = ["new", "learning", "almost", "mastered"];

export function tierOf(entry) {
  if (!entry) return "new";
  if (entry.box <= 2) return "learning";
  if (entry.box <= 4) return "almost";
  return "mastered";
}

/* ───────────────── XP et niveau ───────────────── */

/**
 * XP : 10 par bonne réponse, +25 par élément maîtrisé.
 * Niveau n atteint à 50·n·(n−1) XP (paliers de plus en plus longs).
 */
export function xpOf(state) {
  let xp = 0;
  for (const e of Object.values(state.items || {})) {
    xp += (e.correct || 0) * 10;
    if (e.box >= MAX_BOX) xp += 25;
  }
  return xp;
}

export function levelOf(xp) {
  const level = Math.floor((1 + Math.sqrt(1 + (4 * xp) / 50)) / 2);
  const floor = 50 * level * (level - 1);
  const next = 50 * (level + 1) * level;
  return {
    level,
    xp,
    into: xp - floor,
    span: next - floor,
    pct: Math.round(((xp - floor) / (next - floor)) * 100),
  };
}

/* ───────────────── Répartitions ───────────────── */

/** Répartition par niveau de maîtrise d'une liste de clés. */
export function distribution(keys, items) {
  const counts = { new: 0, learning: 0, almost: 0, mastered: 0 };
  for (const k of keys) counts[tierOf(items[k])]++;
  return counts;
}

/** Score de maîtrise 0–100 : moyenne des boîtes (un mot jamais vu vaut 0). */
export function masteryScore(keys, items) {
  if (!keys.length) return 0;
  let sum = 0;
  for (const k of keys) sum += items[k]?.box || 0;
  return Math.round((sum / (keys.length * MAX_BOX)) * 100);
}

/** Progression par thème de vocabulaire, du plus avancé au moins avancé. */
export function byTheme(vocab, items) {
  const groups = new Map();
  for (const w of vocab || []) {
    const theme = w.theme || "autre";
    if (!groups.has(theme)) groups.set(theme, []);
    groups.get(theme).push(`vocab:${w.id}`);
  }
  return [...groups]
    .map(([theme, keys]) => ({
      theme,
      total: keys.length,
      seen: keys.filter((k) => items[k]).length,
      mastered: keys.filter((k) => items[k]?.box >= MAX_BOX).length,
      score: masteryScore(keys, items),
    }))
    .sort((a, b) => b.score - a.score || b.seen - a.seen);
}

/* ───────────────── Activité ───────────────── */

/**
 * Grille d'activité : `weeks` colonnes de 7 jours (lundi → dimanche),
 * la dernière colonne contenant aujourd'hui.
 */
export function activityGrid(history, weeks = 15, now = Date.now()) {
  const byDay = new Map((history || []).map((h) => [h.day, h]));
  const today = new Date(now);
  const weekday = (today.getUTCDay() + 6) % 7; // lundi = 0
  const start = now - (weeks * 7 - 1 - (6 - weekday)) * DAY;
  const cells = [];
  let max = 0;
  for (let i = 0; i < weeks * 7; i++) {
    const ts = start + i * DAY;
    const day = dayKey(ts);
    const h = byDay.get(day);
    const count = h?.count || 0;
    max = Math.max(max, count);
    cells.push({ day, count, score: h?.score || 0, future: ts > now });
  }
  return { cells, max };
}

/** Intensité 0–4 d'une case (0 = rien). */
export function intensity(count, max) {
  if (!count) return 0;
  if (max <= 1) return 4;
  return Math.min(4, 1 + Math.floor((count / max) * 3.999));
}

/** Les `n` derniers jours, du plus ancien au plus récent. */
export function lastDays(history, n = 14, now = Date.now()) {
  const byDay = new Map((history || []).map((h) => [h.day, h]));
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const day = dayKey(now - i * DAY);
    const h = byDay.get(day);
    out.push({ day, count: h?.count || 0, score: h?.score || 0 });
  }
  return out;
}

/* ───────────────── Révisions à venir ───────────────── */

export function forecast(items, now = Date.now()) {
  const out = { now: 0, tomorrow: 0, week: 0 };
  for (const e of Object.values(items || {})) {
    if (isDue(e, now)) {
      out.now++;
      continue;
    }
    const days = BOX_INTERVALS_DAYS[Math.min(e.box, MAX_BOX) - 1] ?? 0;
    const dueAt = (e.lastSeen || 0) + days * DAY;
    if (dueAt - now <= DAY) out.tomorrow++;
    else if (dueAt - now <= 7 * DAY) out.week++;
  }
  return out;
}

/* ───────────────── Éléments fragiles ───────────────── */

/** Les `n` éléments les plus ratés (au moins 2 vues), du pire au moins pire. */
export function weakest(items, prefix, n = 8) {
  return Object.entries(items || {})
    .filter(([k, e]) => k.startsWith(prefix) && e.seen >= 2 && e.wrong > 0)
    .map(([key, e]) => ({ key, entry: e, failRate: e.wrong / e.seen }))
    .sort((a, b) => b.failRate - a.failRate || a.entry.box - b.entry.box)
    .slice(0, n);
}

/* ───────────────── Badges ───────────────── */

export function badges(state, { vocabTotal = 0 } = {}) {
  const items = Object.entries(state.items || {});
  const vocab = items.filter(([k]) => k.startsWith("vocab:"));
  const answers = items.reduce((n, [, e]) => n + (e.seen || 0), 0);
  const mastered = vocab.filter(([, e]) => e.box >= MAX_BOX).length;
  const lessonsMastered = items.filter(
    ([k, e]) => !k.startsWith("vocab:") && !k.startsWith("exercice:") && e.box >= MAX_BOX,
  ).length;
  const best = state.streak?.best || 0;

  return [
    { id: "first", label: "Premier pas", hint: "Répondre à un exercice", got: answers >= 1 },
    { id: "hundred", label: "Centurion", hint: "100 réponses", got: answers >= 100 },
    { id: "thousand", label: "Marathonien", hint: "1 000 réponses", got: answers >= 1000 },
    { id: "seen50", label: "Curieux", hint: "50 mots rencontrés", got: vocab.length >= 50 },
    { id: "m10", label: "Ça rentre !", hint: "10 mots maîtrisés", got: mastered >= 10 },
    { id: "m100", label: "Dictionnaire vivant", hint: "100 mots maîtrisés", got: mastered >= 100 },
    { id: "s3", label: "Régulier", hint: "3 jours d'affilée", got: best >= 3 },
    { id: "s7", label: "Une semaine !", hint: "7 jours d'affilée", got: best >= 7 },
    { id: "s30", label: "Inarrêtable", hint: "30 jours d'affilée", got: best >= 30 },
    { id: "g5", label: "Grammairien", hint: "5 leçons maîtrisées", got: lessonsMastered >= 5 },
    {
      id: "half",
      label: "Mi-parcours",
      hint: "La moitié du vocabulaire rencontrée",
      got: vocabTotal > 0 && vocab.length >= vocabTotal / 2,
    },
  ];
}
