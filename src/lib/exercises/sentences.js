import { primaryAnswer } from "../normalize";
import {
  acceptedForms,
  analyzeVerb,
  attachParticle,
  conjugate,
} from "../conjugate";
import {
  PARTICLES,
  VERB_ENDINGS,
  endingFor,
  normTitle,
} from "./endings";
import { SLOTS, TEMPLATES } from "./templates";

/**
 * Exercices « phrase complète » : plusieurs points de grammaire (particules,
 * terminaisons) appliqués à des mots du vocabulaire, à partir des modèles de
 * templates.js.
 *
 * Le pivot est un nom du vocabulaire : on choisit un modèle qui a une place
 * pour lui, puis on remplit les autres places avec d'autres mots connus
 * (les plus fragiles d'abord, via ctx.weightOf).
 */

const clean = (s) => String(s || "").trim();
const vocabKey = (w) => `vocab:${w.id}`;
const lessonKey = (l) => `${l.__table}:${l.id}`;

/** Index hangeul → mot, mis en cache par tableau de vocabulaire. */
const indexCache = new WeakMap();
function vocabIndex(vocab) {
  if (!vocab) return new Map();
  let index = indexCache.get(vocab);
  if (!index) {
    index = new Map();
    for (const w of vocab) {
      const k = clean(w.hangul);
      if (k && w.fr && !index.has(k)) index.set(k, w);
    }
    indexCache.set(vocab, index);
  }
  return index;
}

function findLesson(lessons, table, test) {
  return (lessons || []).find(
    (l) => l.__table === table && test.test(normTitle(l.title)),
  );
}

/** Particule (règle + leçon) d'une partie, ou null si la leçon manque. */
function resolveParticle(g, lessons) {
  if (g.fixed) {
    const lesson = findLesson(lessons, "grammaire", g.lesson);
    return lesson ? { lesson, label: g.label, apply: (n) => n + g.fixed } : null;
  }
  const p = PARTICLES.find((x) => x.id === g.alt);
  const lesson = p && findLesson(lessons, "grammaire", p.test);
  return lesson
    ? { lesson, label: g.label, apply: (n) => attachParticle(n, p.rule) }
    : null;
}

/** Terminaison (règle + leçon) d'une partie verbale, ou null. */
function resolveEnding(ending, lessons, pos, verb) {
  if (typeof ending === "object") {
    const lesson = findLesson(lessons, "verbes", ending.lesson);
    return lesson ? { lesson, label: ending.label, rule: ending.custom } : null;
  }
  const spec = VERB_ENDINGS.find((s) => s.id === ending);
  const rule = endingFor(spec, pos, verb);
  const lesson = spec && findLesson(lessons, "verbes", spec.test);
  return rule && lesson ? { lesson, label: spec.label, rule } : null;
}

function weightedPick(rng, items, weightOf) {
  if (!items.length) return undefined;
  const weights = items.map((x) => Math.max(weightOf(x), 0));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return rng.pick(items);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r < 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Construit une phrase à partir d'un modèle, ou null si une place, une
 * leçon ou une conjugaison manque.
 *
 * @returns {null | {
 *   template: object,
 *   pieces: { text: string, blank?: string, hint?: string, keys: string[] }[],
 *   sentence: string, fr: string, words: object[], lessons: object[],
 *   labels: string[]
 * }}
 */
export function buildSentence(template, pivot, ctx, rng) {
  const index = vocabIndex(ctx?.vocab);
  const lessons = ctx?.lessons || [];
  const weightOf = (key) => (ctx?.weightOf ? ctx.weightOf(key) : 1);
  const pivotKey = clean(pivot?.hangul);

  const used = new Set();
  const filled = {}; // nom de place (ou alias) → mot
  const pieces = [];
  const words = [];
  const usedLessons = [];
  const labels = [];
  let pivotPlaced = false;

  /**
   * `after` : nom d'une place déjà remplie ; le mot choisi doit venir après
   * lui dans la liste (월요일부터 금요일까지, pas l'inverse).
   */
  const pickWord = (slot, after) => {
    const list = SLOTS[slot] || [];
    const minIndex = after
      ? list.indexOf(clean(filled[after]?.hangul)) + 1
      : 0;
    const allowed = (h) => list.indexOf(h) >= minIndex;
    if (
      !pivotPlaced &&
      list.includes(pivotKey) &&
      !used.has(pivotKey) &&
      allowed(pivotKey)
    ) {
      pivotPlaced = true;
      return pivot;
    }
    const candidates = list
      .filter((h) => !used.has(h) && h !== pivotKey && allowed(h))
      .map((h) => index.get(h))
      .filter(Boolean);
    return weightedPick(rng, candidates, (w) => weightOf(vocabKey(w)));
  };

  for (const part of template.parts) {
    if (part.text) {
      pieces.push({ text: part.text, keys: [] });
      continue;
    }

    if (part.slot) {
      const word = pickWord(part.slot, part.after);
      if (!word) return null;
      const noun = clean(word.hangul);
      used.add(noun);
      filled[part.as || part.slot] = word;
      words.push(word);

      const particle = resolveParticle(part.g, lessons);
      if (!particle) return null;
      const full = particle.apply(noun);
      if (!full) return null;
      usedLessons.push(particle.lesson);
      labels.push(particle.label);
      pieces.push({
        text: noun,
        blank: full.slice(noun.length),
        keys: [lessonKey(particle.lesson)],
      });
      continue;
    }

    // Partie verbale
    const pos = part.pos || "verb";
    let dict = part.verb;
    let verbWord = dict ? index.get(dict) : null;
    if (part.verbSlot) {
      verbWord = pickWord(part.verbSlot);
      if (!verbWord) return null;
      dict = clean(verbWord.hangul);
      used.add(dict);
      filled[part.verbSlot] = verbWord;
    }
    const verb = analyzeVerb(dict, pos);
    const ending = verb && resolveEnding(part.ending, lessons, pos, verb);
    const form = ending && conjugate(verb, ending.rule);
    if (!form) return null;

    usedLessons.push(ending.lesson);
    labels.push(ending.label);
    if (verbWord) words.push(verbWord);
    // « 비가 오다 » : le sujet reste affiché, seul le verbe est à conjuguer
    if (verb.prefix) pieces.push({ text: verb.prefix, keys: [] });
    const strip = (f) => (verb.prefix ? f.slice(verb.prefix.length + 1) : f);
    pieces.push({
      text: "",
      blank: strip(form),
      // autres formes correctes (돼요 / 되어요), acceptées en saisie
      alts: acceptedForms(verb, ending.rule).map(strip),
      hint: `${verb.dict} → ${endingTag(ending.label)}`,
      dict: verb.dict,
      keys: [
        lessonKey(ending.lesson),
        ...(verbWord ? [vocabKey(verbWord)] : []),
      ],
    });
  }

  // Le pivot doit figurer dans la phrase (sinon l'exercice ne le révise pas)
  if (pivot && !pivotPlaced) return null;

  const render = (choose) =>
    pieces
      .map((p) => {
        const blank = p.blank ? choose(p) : "";
        return blank && p.text ? p.text + blank : p.text || blank;
      })
      .join(" ");
  const sentence = render((p) => p.blank);

  // Toutes les phrases correctes (produit des variantes de chaque trou)
  let sentences = [""];
  for (const p of pieces) {
    const options = p.blank ? p.alts || [p.blank] : [null];
    sentences = sentences.flatMap((prefix) =>
      options.map((o) => {
        const chunk = o != null && p.text ? p.text + o : p.text || o || "";
        return prefix ? `${prefix} ${chunk}` : chunk;
      }),
    );
  }

  const fr = template.fr.replace(/\{(\w+)\}/g, (m, name) => {
    const w = filled[name];
    return w ? `« ${primaryAnswer(w.fr)} »` : m;
  });

  return {
    template,
    pieces,
    sentence,
    sentences: [...new Set(sentences)],
    fr,
    words,
    lessons: usedLessons,
    labels: [...new Set(labels)],
  };
}

/** Modèles ayant une place pour ce mot. */
export function templatesFor(word) {
  const key = clean(word?.hangul);
  if (!key) return [];
  return TEMPLATES.filter((t) =>
    t.parts.some(
      (p) =>
        (p.slot && SLOTS[p.slot]?.includes(key)) ||
        (p.verbSlot && SLOTS[p.verbSlot]?.includes(key)),
    ),
  );
}

function sentenceFor(w, rng, ctx) {
  for (const template of rng.shuffle(templatesFor(w))) {
    const built = buildSentence(template, w, ctx, rng);
    if (built) return built;
  }
  return null;
}

function allKeys(s) {
  return [
    ...new Set([...s.words.map(vocabKey), ...s.lessons.map(lessonKey)]),
  ];
}

/* ───────────────── 11. Phrase à trous multiples ───────────────── */

export const sentenceBlanks = {
  kind: "sentence-blanks",
  source: "vocab",
  generate(w, pool, rng, ctx) {
    const s = sentenceFor(w, rng, ctx);
    if (!s) return null;

    const segments = [];
    const blankKeys = {};
    let index = 0;
    s.pieces.forEach((p, i) => {
      if (i > 0) segments.push({ type: "text", value: " " });
      if (p.text) segments.push({ type: "text", value: p.text });
      if (p.blank) {
        blankKeys[index] = p.keys;
        segments.push({
          type: "blank",
          index: index++,
          answer: (p.alts || [p.blank]).join("/"),
          hint: p.hint,
        });
      }
    });
    // Fusionne les textes contigus (affichage plus propre)
    const merged = [];
    for (const seg of segments) {
      const prev = merged.at(-1);
      if (seg.type === "text" && prev?.type === "text") prev.value += seg.value;
      else merged.push({ ...seg });
    }

    return {
      id: `sentence-blanks:${s.template.id}:${s.sentence}`,
      kind: "sentence-blanks",
      level: String(w.level),
      prompt: "Complète la phrase (particules et conjugaison)",
      promptSub: s.fr,
      segments: merged,
      expected: s.pieces.filter((p) => p.blank).map((p) => p.blank),
      blankKeys,
      lang: "ko",
      grammarPoint: s.labels.join(" · "),
      reveal: s.sentence,
      tag: "Phrase complète",
      sourceKey: vocabKey(w),
      sourceKeys: allKeys(s),
    };
  },
};

/* ───────────────── 12. Construire la phrase ───────────────── */

export const sentenceBuild = {
  kind: "sentence-build",
  source: "vocab",
  generate(w, pool, rng, ctx) {
    const s = sentenceFor(w, rng, ctx);
    if (!s) return null;

    const ingredients = s.pieces
      .map((p) => (p.blank && p.text ? p.text : p.dict || p.text))
      .filter(Boolean);

    return {
      id: `sentence-build:${s.template.id}:${s.sentence}`,
      kind: "sentence-build",
      level: String(w.level),
      prompt: "Traduis en coréen",
      promptSub: `Avec : ${ingredients.join(" · ")}`,
      question: s.fr,
      expected: s.sentences.join("/"),
      lang: "ko",
      grammarPoint: s.labels.join(" · "),
      reveal: s.sentence,
      tag: "Phrase complète",
      sourceKey: vocabKey(w),
      sourceKeys: allKeys(s),
    };
  },
};

/** « antériorité -기 전에 » → « -기 전에 » (partie coréenne du libellé). */
function endingTag(label) {
  const at = String(label).indexOf("-");
  return at >= 0 ? label.slice(at).replace(/\s*\?$/, "") : label;
}
