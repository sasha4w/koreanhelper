/**
 * Conversion entre l'état de progression local (progress.js) et les lignes
 * Supabase (user_progress_items, user_stats, user_history). Sans dépendance
 * réseau : testable hors navigateur.
 */

export function emptySnapshot() {
  return { items: new Map(), history: new Map(), stats: "" };
}

const itemSig = (e) => `${e.box}|${e.seen}|${e.correct}|${e.wrong}|${e.lastSeen ?? ""}`;
const histSig = (h) => `${h.count}|${h.score}`;
const statsSig = (s) => `${s?.current || 0}|${s?.best || 0}|${s?.lastDay || ""}`;

/** Lignes Supabase → état au format de progress.js. */
export function rowsToState({ items = [], stats = null, history = [] }) {
  const state = { items: {}, streak: { current: 0, best: 0, lastDay: null }, history: [] };
  for (const r of items) {
    state.items[r.item_key] = {
      box: r.box,
      seen: r.seen,
      correct: r.correct,
      wrong: r.wrong,
      lastSeen: r.last_seen ? new Date(r.last_seen).getTime() : null,
    };
  }
  if (stats) {
    state.streak = {
      current: stats.streak_current,
      best: stats.streak_best,
      lastDay: stats.last_day,
    };
  }
  state.history = history
    .map((h) => ({ day: h.day, count: h.count, score: h.score }))
    .sort((a, b) => a.day.localeCompare(b.day));
  return state;
}

/** Ce qui diffère entre l'état local et ce que le serveur a déjà. */
export function diffForServer(state, snapshot) {
  const items = [];
  for (const [key, e] of Object.entries(state.items || {})) {
    if (snapshot.items.get(key) !== itemSig(e)) {
      items.push({ key, box: e.box, seen: e.seen, correct: e.correct, wrong: e.wrong, lastSeen: e.lastSeen });
    }
  }
  const history = (state.history || []).filter(
    (h) => snapshot.history.get(h.day) !== histSig(h),
  );
  const stats = statsSig(state.streak) !== snapshot.stats ? state.streak : null;
  return { items, history, stats };
}

export function snapshotOf(state) {
  const snap = emptySnapshot();
  for (const [k, e] of Object.entries(state.items || {})) snap.items.set(k, itemSig(e));
  for (const h of state.history || []) snap.history.set(h.day, histSig(h));
  snap.stats = statsSig(state.streak);
  return snap;
}

