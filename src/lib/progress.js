/**
 * Progression locale (localStorage) — système de Leitner à 5 boîtes.
 * Tout est enveloppé dans des try/catch : navigation privée, quota plein
 * ou stockage désactivé ne doivent jamais casser une session de révision.
 */

const KEY = "kh:progress:v1";
const DAY = 24 * 60 * 60 * 1000;

/** Intervalle avant re-présentation, par boîte (index = box - 1). */
export const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 21];
export const MAX_BOX = BOX_INTERVALS_DAYS.length;

const EMPTY = () => ({
  items: {},
  streak: { current: 0, best: 0, lastDay: null },
  history: [],
});

let memory = null; // repli si localStorage est indisponible
const listeners = new Set();

function read() {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    memory = raw ? { ...EMPTY(), ...JSON.parse(raw) } : EMPTY();
  } catch {
    memory = EMPTY();
  }
  return memory;
}

function write(state) {
  memory = state;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // stockage plein ou refusé : on garde l'état en mémoire pour la session
  }
  listeners.forEach((fn) => fn(state));
}

/** S'abonne aux changements (pour rafraîchir l'accueil). */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return read();
}

const dayKey = (ts = Date.now()) => new Date(ts).toISOString().slice(0, 10);

/* ───────────────── Enregistrement d'une réponse ───────────────── */

/**
 * Boîte maximale atteignable avec un exercice « facile » (QCM, appariement) :
 * reconnaître un mot parmi 4 ne prouve pas qu'on sait le produire. Pour aller
 * au-delà (presque acquis → maîtrisé), il faut réussir un exercice de saisie.
 */
export const EASY_MAX_BOX = 3;

/**
 * Boîte suivante après une réponse.
 *  - juste : +1 (plafonné à EASY_MAX_BOX si l'exercice est facile, sans
 *    jamais faire redescendre un mot déjà plus haut)
 *  - faux  : −1, ou −2 depuis « presque acquis » / « maîtrisé » (boîte ≥ 4),
 *    au lieu de l'ancien retour brutal en boîte 1
 */
export function nextBox(box, ok, { easy = false } = {}) {
  const current = Math.min(Math.max(box || 1, 1), MAX_BOX);
  if (ok) {
    if (easy && current >= EASY_MAX_BOX) return current;
    return Math.min(current + 1, easy ? EASY_MAX_BOX : MAX_BOX);
  }
  return Math.max(1, current - (current >= 4 ? 2 : 1));
}

/**
 * @param {string} sourceKey ex. "vocab:123"
 * @param {boolean} ok
 * @param {{ easy?: boolean }} [opts] easy : exercice de reconnaissance (QCM…)
 */
export function recordAnswer(sourceKey, ok, opts = {}) {
  if (!sourceKey) return;
  const state = read();
  const now = Date.now();
  const prev = state.items[sourceKey] || {
    seen: 0,
    correct: 0,
    wrong: 0,
    box: 1,
    lastSeen: null,
  };

  const box = nextBox(prev.box, ok, opts);

  write({
    ...state,
    items: {
      ...state.items,
      [sourceKey]: {
        seen: prev.seen + 1,
        correct: prev.correct + (ok ? 1 : 0),
        wrong: prev.wrong + (ok ? 0 : 1),
        box,
        lastSeen: now,
      },
    },
  });
}

/** À appeler à la fin d'une session : met à jour la série et l'historique. */
export function recordSession({ count, score }) {
  const state = read();
  const today = dayKey();
  const { streak } = state;

  let next = streak;
  if (streak.lastDay !== today) {
    const yesterday = dayKey(Date.now() - DAY);
    const current = streak.lastDay === yesterday ? streak.current + 1 : 1;
    next = {
      current,
      best: Math.max(current, streak.best || 0),
      lastDay: today,
    };
  }

  const history = [...state.history];
  const existing = history.find((h) => h.day === today);
  if (existing) {
    existing.count += count;
    existing.score += score;
  } else {
    history.push({ day: today, count, score });
  }

  write({ ...state, streak: next, history: history.slice(-90) });
}

/* ───────────────── Lecture ───────────────── */

/** Un item est « dû » si l'intervalle de sa boîte est écoulé. */
export function isDue(entry, now = Date.now()) {
  if (!entry || !entry.lastSeen) return true;
  const days = BOX_INTERVALS_DAYS[Math.min(entry.box, MAX_BOX) - 1] ?? 0;
  return now - entry.lastSeen >= days * DAY;
}

export function getEntry(sourceKey) {
  return read().items[sourceKey] || null;
}

/**
 * Poids de tirage d'un item hors révision due, par boîte (index = box - 1) :
 * plus un mot est acquis, plus il se fait rare dans les tirages aléatoires.
 */
export const NOT_DUE_WEIGHTS = [0.5, 0.3, 0.15, 0.08, 0.03];

/**
 * Poids de tirage d'un item (tirage pondéré, voir buildSession) :
 *  - jamais vu        → 1
 *  - dû               → 1.5 à ~3.5 selon le taux d'échec (révisions d'abord)
 *  - pas encore dû    → NOT_DUE_WEIGHTS[box - 1] (0.5 → 0.03)
 */
export function selectionWeight(sourceKey, now = Date.now(), state = read()) {
  const entry = state.items[sourceKey];
  if (!entry) return 1;
  const box = Math.min(Math.max(entry.box || 1, 1), MAX_BOX);
  if (isDue(entry, now)) {
    const failRate = entry.seen ? entry.wrong / entry.seen : 0;
    return 1.5 + failRate * 2 - (box - 1) * 0.1;
  }
  return NOT_DUE_WEIGHTS[box - 1];
}

/** Item maîtrisé (boîte max) et pas encore à revoir. */
export function isMasteredNotDue(sourceKey, now = Date.now(), state = read()) {
  const entry = state.items[sourceKey];
  return Boolean(entry && entry.box >= MAX_BOX && !isDue(entry, now));
}

/** Items dus, triés du plus urgent (le plus raté) au moins urgent. */
export function getDueEntries(now = Date.now()) {
  return Object.entries(read().items)
    .filter(([, e]) => isDue(e, now))
    .map(([key, entry]) => ({ key, entry }))
    .sort((a, b) => {
      const failA = a.entry.seen ? a.entry.wrong / a.entry.seen : 0;
      const failB = b.entry.seen ? b.entry.wrong / b.entry.seen : 0;
      return failB - failA || a.entry.box - b.entry.box;
    });
}

export function getStats() {
  const state = read();
  const entries = Object.entries(state.items);
  const now = Date.now();

  const due = entries.filter(([, e]) => isDue(e, now)).length;
  const mastered = entries.filter(([, e]) => e.box >= MAX_BOX).length;
  const seen = entries.length;
  const totalAnswers = entries.reduce((n, [, e]) => n + e.seen, 0);
  const totalCorrect = entries.reduce((n, [, e]) => n + e.correct, 0);

  return {
    seen,
    due,
    mastered,
    accuracy: totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0,
    streak: state.streak,
    today: state.history.find((h) => h.day === dayKey()) || null,
    history: state.history,
  };
}

/** Les n items les plus fragiles (plus d'échecs que de réussites d'abord). */
export function getWeak(n = 20) {
  return Object.entries(read().items)
    .filter(([, e]) => e.wrong > 0)
    .sort((a, b) => b[1].wrong / b[1].seen - a[1].wrong / a[1].seen)
    .slice(0, n)
    .map(([key]) => key);
}

export function reset() {
  write(EMPTY());
}
