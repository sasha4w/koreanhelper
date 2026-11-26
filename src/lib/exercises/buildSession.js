import { makeRng } from "./rng";
import { GENERATORS_BY_KIND, VOCAB_KINDS, LESSON_KINDS } from "./generators";
import { fromDbRows } from "./fromDb";
import { getState, isMasteredNotDue, selectionWeight } from "../progress";

export const ALL_KINDS = [...VOCAB_KINDS, ...LESSON_KINDS];

/** Part maximale d'items maîtrisés (non dus) dans une session. */
export const MASTERED_SHARE = 0.1;

/**
 * Ordre de passage par tirage pondéré sans remise (Efraimidis–Spirakis) :
 * chaque item reçoit une clé -ln(u) / poids, les plus petites passent d'abord.
 * Un item à poids 3 sort en moyenne bien avant un item à poids 0.03, sans que
 * l'ordre soit figé d'une session à l'autre.
 *
 * @template T
 * @param {T[]} items
 * @param {(item: T) => string} keyOf clé de progression ("vocab:12"…)
 * @param {Function} rng générateur seedé (rng.js)
 * @returns {T[]}
 */
export function orderByNeed(items, keyOf, rng) {
  const state = getState();
  const now = Date.now();
  return items
    .map((item) => {
      const weight = Math.max(selectionWeight(keyOf(item), now, state), 1e-6);
      const u = Math.max(rng(), 1e-12);
      return { item, rank: -Math.log(u) / weight };
    })
    .sort((a, b) => a.rank - b.rank)
    .map(({ item }) => item);
}

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
  const allLessons = [
    ...tagTable(grammaire, "grammaire"),
    ...tagTable(verbes, "verbes"),
  ];
  const lessonPool = allLessons.filter((l) => matchesLesson(l, filters));

  // Exercices vocab × grammaire : un thème ou un chapitre de vocabulaire
  // n'exclut pas les leçons (on conjugue les mots du thème) ; seul le niveau
  // compte, de façon cumulative : au niveau 2, la grammaire du niveau 1
  // (particules…) reste acquise et réutilisable.
  const progressState = getState();
  const ctx = {
    lessons: allLessons.filter((l) => levelAtMost(l, filters.level)),
    // Mots pour compléter les phrases (le pivot vient du filtre, les autres
    // places peuvent venir de tout le vocabulaire déjà vu)
    vocab: vocab.filter((w) => levelAtMost(w, filters.level)),
    weightOf: useProgress
      ? (key) => selectionWeight(key, Date.now(), progressState)
      : () => 1,
  };

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

  const ordered = useProgress
    ? orderByNeed(candidates, sourceKeyOf, rng)
    : rng.shuffle(candidates);

  // Les items maîtrisés et pas encore dus ne prennent qu'une petite part de
  // la session (rappel ponctuel) ; ils ne complètent la session qu'en dernier
  // recours, quand le filtre ne laisse rien d'autre.
  const masteredCap = Math.max(1, Math.floor(count * MASTERED_SHARE));
  const state = getState();
  const now = Date.now();
  const isMastered = (c) =>
    useProgress && isMasteredNotDue(sourceKeyOf(c), now, state);
  const firstPass = [];
  const overflow = [];
  let masteredTaken = 0;
  for (const c of ordered) {
    if (isMastered(c) && masteredTaken >= masteredCap) overflow.push(c);
    else {
      if (isMastered(c)) masteredTaken++;
      firstPass.push(c);
    }
  }

  const vocabKinds = VOCAB_KINDS.filter((k) => enabled.has(k));
  const lessonKinds = LESSON_KINDS.filter((k) => enabled.has(k));

  // 3) Pour chaque item, on tente un type d'exercice compatible.
  for (const { item, source } of [...firstPass, ...overflow]) {
    if (exercises.length >= count) break;
    if (source === "vocab" && consumedVocab.has(item.id)) continue;

    const pool = source === "vocab" ? vocabPool : lessonPool;
    const available = source === "vocab" ? vocabKinds : lessonKinds;
    if (!available.length) continue;

    for (const kind of rng.shuffle(available)) {
      const generator = GENERATORS_BY_KIND[kind];
      if (!generator) continue;

      const exo = safeGenerate(generator, item, pool, rng, ctx);
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

function safeGenerate(generator, item, pool, rng, ctx) {
  try {
    return generator.generate(item, pool, rng, ctx);
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

/** Niveau inférieur ou égal au filtre (« all » : tout). */
function levelAtMost(row, level) {
  if (!level || level === "all") return true;
  const n = Number(row.level);
  return Number.isFinite(n) ? n <= Number(level) : levelOk(row, level);
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
