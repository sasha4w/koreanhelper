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
 * @param {string} sourceKey ex. "vocab:123"
 * @param {boolean} ok
 */
export function recordAnswer(sourceKey, ok) {
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

  const box = ok ? Math.min(prev.box + 1, MAX_BOX) : 1;

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
 * Priorité de révision d'un item : plus le score est haut, plus il passe tôt.
 *  - jamais vu       → 50 (on veut de la nouveauté, sans noyer les révisions)
 *  - dû et raté      → jusqu'à 100
 *  - maîtrisé récent → 0
 */
export function priority(sourceKey, now = Date.now()) {
  const entry = read().items[sourceKey];
  if (!entry) return 50;
  if (!isDue(entry, now)) return 0;
  const failRate = entry.seen ? entry.wrong / entry.seen : 0;
  return 60 + failRate * 40 - (entry.box - 1) * 5;
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
