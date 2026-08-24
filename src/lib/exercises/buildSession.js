import { makeRng } from "./rng";
import { GENERATORS_BY_KIND, VOCAB_KINDS, LESSON_KINDS } from "./generators";
import { fromDbRows } from "./fromDb";
import { priority } from "../progress";

export const ALL_KINDS = [...VOCAB_KINDS, ...LESSON_KINDS];

/**
 * Construit une session d'exercices à partir des données brutes.
 *
 * @param {object}   o
 * @param {object[]} o.vocab        lignes `vocabulaire`
 * @param {object[]} o.grammaire    lignes `grammaire`
 * @param {object[]} o.verbes       lignes `verbes`
 * @param {object[]} o.dbExercices  lignes `exercices` (écrites à la main)
 * @param {object}   o.filters      { level, chapitre, partie, theme, tag }
 * @param {string[]} o.kinds        types d'exercices activés
 * @param {number}   o.count        nombre d'exercices visés
 * @param {boolean}  o.useProgress  pondérer par la révision espacée
 * @param {number}   o.seed         graine (session reproductible)
 * @returns {object[]} exercices normalisés
 */
export function buildSession({
  vocab = [],
  grammaire = [],
  verbes = [],
  dbExercices = [],
  filters = {},
  kinds = ALL_KINDS,
  count = 15,
  useProgress = true,
  seed,
} = {}) {
  const rng = makeRng(seed ?? Math.floor(Math.random() * 2 ** 31));
  const enabled = new Set(kinds);

  const vocabPool = vocab.filter((w) => matchesVocab(w, filters));
  const lessonPool = [
    ...tagTable(grammaire, "grammaire"),
    ...tagTable(verbes, "verbes"),
  ].filter((l) => matchesLesson(l, filters));

  const exercises = [];
  const usedIds = new Set(); // exercices déjà produits
  const consumedVocab = new Set(); // mots déjà engagés (appariement)

  // 1) Exercices écrits à la main : ils passent en premier, ils sont plus riches.
  if (enabled.has("db-qcm") || enabled.has("db-blanks")) {
    const fromDb = fromDbRows(dbExercices)
      .filter((e) => enabled.has(e.kind) && matchesDb(e, filters))
      .slice();
    for (const exo of rng.shuffle(fromDb)) {
      if (exercises.length >= count) break;
      exercises.push(exo);
      usedIds.add(exo.id);
    }
  }

  // 2) Ordre de passage des items : les plus urgents d'abord.
  const candidates = [
    ...vocabPool.map((item) => ({ item, source: "vocab" })),
    ...lessonPool.map((item) => ({ item, source: "lesson" })),
  ];

  const scored = rng.shuffle(candidates).map((c) => ({
    ...c,
    score: useProgress
      ? priority(sourceKeyOf(c)) + rng() * 12 // bruit : évite un ordre figé
      : rng() * 100,
  }));
  scored.sort((a, b) => b.score - a.score);

  const vocabKinds = VOCAB_KINDS.filter((k) => enabled.has(k));
  const lessonKinds = LESSON_KINDS.filter((k) => enabled.has(k));

  // 3) Pour chaque item, on tente un type d'exercice compatible.
  for (const { item, source } of scored) {
    if (exercises.length >= count) break;
    if (source === "vocab" && consumedVocab.has(item.id)) continue;

    const pool = source === "vocab" ? vocabPool : lessonPool;
    const available = source === "vocab" ? vocabKinds : lessonKinds;
    if (!available.length) continue;

    for (const kind of rng.shuffle(available)) {
      const generator = GENERATORS_BY_KIND[kind];
      if (!generator) continue;

      const exo = safeGenerate(generator, item, pool, rng);
      if (!exo || usedIds.has(exo.id)) continue;

      usedIds.add(exo.id);
      exercises.push(exo);
      if (exo.consumedIds) exo.consumedIds.forEach((id) => consumedVocab.add(id));
      else if (source === "vocab") consumedVocab.add(item.id);
      break;
    }
  }

  return rng.shuffle(exercises).slice(0, count);
}

function safeGenerate(generator, item, pool, rng) {
  try {
    return generator.generate(item, pool, rng);
  } catch (err) {
    console.warn(`Générateur "${generator.kind}" en échec :`, err);
    return null;
  }
}

function sourceKeyOf({ item, source }) {
  return source === "vocab"
    ? `vocab:${item.id}`
    : `${item.__table}:${item.id}`;
}

function tagTable(rows, table) {
  return (rows || []).map((row) => ({ ...row, __table: table }));
}

/* ───────────────── Filtres ───────────────── */

function levelOk(row, level) {
  return !level || level === "all" || String(row.level) === String(level);
}

function matchesVocab(w, f) {
  if (!levelOk(w, f.level)) return false;
  if (f.chapitre != null && Number(w.chapitre) !== Number(f.chapitre))
    return false;
  if (f.partie != null && Number(w.partie) !== Number(f.partie)) return false;
  if (f.theme && f.theme !== "all" && w.theme !== f.theme) return false;
  return true;
}

function matchesLesson(l, f) {
  if (!levelOk(l, f.level)) return false;
  // Les leçons n'ont ni chapitre ni thème : cibler un chapitre ou un thème de
  // vocabulaire les rendrait hors sujet, on les écarte alors entièrement.
  if (f.chapitre != null) return false;
  if (f.theme && f.theme !== "all") return false;
  return true;
}

function matchesDb(e, f) {
  if (!levelOk(e, f.level)) return false;
  if (f.tag && f.tag !== "Tous" && e.tag !== f.tag) return false;
  return true;
}

/* ───────────────── Utilitaires d'inventaire ───────────────── */

/** Thèmes disponibles pour un niveau donné. */
export function availableThemes(vocab, level) {
  const set = new Set();
  for (const w of vocab) {
    if (!levelOk(w, level)) continue;
    if (w.theme) set.add(w.theme);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "fr"));
}

/** Paires (chapitre, partie) disponibles pour un niveau donné. */
export function availableChapters(vocab, level) {
  const map = new Map();
  for (const w of vocab) {
    if (!levelOk(w, level)) continue;
    if (w.chapitre == null || w.partie == null) continue;
    const key = `${w.chapitre}-${w.partie}`;
    map.set(key, {
      chapitre: w.chapitre,
      partie: w.partie,
      count: (map.get(key)?.count || 0) + 1,
    });
  }
  return [...map.values()].sort((a, b) =>
    a.chapitre !== b.chapitre
      ? a.chapitre - b.chapitre
      : a.partie - b.partie,
  );
}
