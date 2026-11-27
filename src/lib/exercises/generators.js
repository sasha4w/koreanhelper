import { primaryAnswer } from "../normalize";
import {
  acceptedForms,
  analyzeVerb,
  attachParticle,
  commonMistakes,
  conjugate,
} from "../conjugate";
import {
  endingFor,
  particleForLesson,
  verbEndingForLesson,
  verbPos,
} from "./endings";
import { sentenceBlanks, sentenceBuild } from "./sentences";

/**
 * Chaque générateur : { kind, source, generate(pivot, pool, rng, ctx) -> Exercise|null }
 * `pool` est l'ensemble des items disponibles de la même source (pour les distracteurs).
 * `ctx` (optionnel) donne accès aux leçons pour les exercices vocab × grammaire.
 * Retourner null = « pas assez de matière », l'orchestrateur enchaîne sur un autre type.
 */

const uid = (kind, id, salt = "") => `${kind}:${id}${salt ? `:${salt}` : ""}`;

/* ───────────────── helpers vocabulaire ───────────────── */

const hasWord = (w) => w?.hangul?.trim() && w?.fr?.trim();

/**
 * Distracteurs de qualité : on privilégie le même thème ET le même type,
 * puis le même thème, puis le même type, puis n'importe quoi.
 * Un QCM dont les mauvaises réponses viennent d'un autre univers n'apprend rien.
 */
function pickDistractors(target, pool, rng, count, valueOf) {
  const targetValue = valueOf(target);
  const seen = new Set([normalizeKey(targetValue)]);
  const out = [];

  const tiers = [
    (w) => w.theme && w.theme === target.theme && w.type === target.type,
    (w) => w.theme && w.theme === target.theme,
    (w) => w.type && w.type === target.type,
    () => true,
  ];

  for (const matches of tiers) {
    if (out.length >= count) break;
    // Jamais un homonyme de la cible (쓰다 « écrire » / « utiliser ») :
    // son sens serait aussi une bonne réponse.
    const candidates = rng.shuffle(
      pool.filter(
        (w) =>
          w.id !== target.id &&
          hasWord(w) &&
          normalizeKey(w.hangul) !== normalizeKey(target.hangul) &&
          matches(w),
      ),
    );
    for (const w of candidates) {
      if (out.length >= count) break;
      const value = valueOf(w);
      const key = normalizeKey(value);
      if (!value || seen.has(key)) continue;
      seen.add(key);
      out.push(value);
    }
  }

  return out.length === count ? out : null;
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

const wordHint = (w) =>
  [w.type, w.theme].filter(Boolean).join(" · ") || undefined;

/* ───────────────── 1. FR → 한글 (saisie) ───────────────── */

/**
 * Réponses coréennes acceptées pour un mot du vocabulaire, séparées par
 * « / » (format lu par isCorrect). Le contexte entre parenthèses sert à
 * distinguer les homonymes ; il est facultatif à la saisie :
 *   "(글을) 쓰다"      → "(글을) 쓰다/쓰다/글을 쓰다"
 *   "헨드폰/휴대전화"   → chaque variante, telle quelle
 */
export function koreanAnswers(hangul) {
  const out = new Set();
  for (const raw of String(hangul || "").split("/")) {
    const v = raw.trim();
    if (!v) continue;
    out.add(v);
    const bare = v.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
    if (bare) out.add(bare);
    const flat = v.replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
    if (flat) out.add(flat);
  }
  return [...out].join("/");
}

const frToKo = {
  kind: "fr-to-ko",
  source: "vocab",
  generate(w) {
    if (!hasWord(w)) return null;
    return {
      id: uid("fr-to-ko", w.id),
      kind: "fr-to-ko",
      level: String(w.level),
      prompt: "Écris ce mot en coréen",
      question: w.fr,
      expected: koreanAnswers(w.hangul),
      lang: "ko",
      hint: wordHint(w),
      reveal: w.hangul,
      tag: w.theme || undefined,
      sourceKey: `vocab:${w.id}`,
    };
  },
};

/* ───────────────── 2. 한글 → FR (QCM) ───────────────── */

const koToFr = {
  kind: "ko-to-fr",
  source: "vocab",
  generate(w, pool, rng) {
    if (!hasWord(w)) return null;
    const answer = primaryAnswer(w.fr);
    const distractors = pickDistractors(w, pool, rng, 3, (x) =>
      primaryAnswer(x.fr),
    );
    if (!distractors) return null;

    return {
      id: uid("ko-to-fr", w.id),
      kind: "ko-to-fr",
      level: String(w.level),
      prompt: "Que signifie ce mot ?",
      question: w.hangul,
      questionLang: "ko",
      expected: answer,
      choices: rng.shuffle([answer, ...distractors]),
      lang: "fr",
      hint: w.type || undefined,
      tag: w.theme || undefined,
      sourceKey: `vocab:${w.id}`,
    };
  },
};

/* ───────────────── 3. Appariement ───────────────── */

const MATCH_SIZE = 5;

const matching = {
  kind: "matching",
  source: "vocab",
  consumes: MATCH_SIZE,
  generate(w, pool, rng) {
    if (!hasWord(w)) return null;

    // On reste dans le même thème quand c'est possible : plus cohérent à lire.
    const sameTheme = pool.filter(
      (x) => x.id !== w.id && hasWord(x) && x.theme && x.theme === w.theme,
    );
    const others = pool.filter(
      (x) => x.id !== w.id && hasWord(x) && (!w.theme || x.theme !== w.theme),
    );

    // Ni deux fois le même hangeul (homonymes : 쓰다 ×4), ni deux fois la
    // même traduction : chaque paire doit avoir une seule réponse possible.
    const seenKo = new Set([normalizeKey(w.hangul)]);
    const seenFr = new Set([normalizeKey(primaryAnswer(w.fr))]);
    const partners = [];
    for (const x of [...rng.shuffle(sameTheme), ...rng.shuffle(others)]) {
      if (partners.length >= MATCH_SIZE - 1) break;
      const ko = normalizeKey(x.hangul);
      const fr = normalizeKey(primaryAnswer(x.fr));
      if (seenKo.has(ko) || seenFr.has(fr)) continue;
      seenKo.add(ko);
      seenFr.add(fr);
      partners.push(x);
    }

    if (partners.length < 2) return null;

    const words = rng.shuffle([w, ...partners]);
    return {
      id: uid("matching", words.map((x) => x.id).join("-")),
      kind: "matching",
      level: String(w.level),
      prompt: "Associe chaque mot à sa traduction",
      pairs: words.map((x) => ({
        id: x.id,
        ko: x.hangul,
        fr: primaryAnswer(x.fr),
      })),
      tag: w.theme || undefined,
      sourceKey: `vocab:${w.id}`,
      sourceKeys: words.map((x) => `vocab:${x.id}`),
      consumedIds: words.map((x) => x.id),
    };
  },
};

/* ───────────────── 4. L'intrus ───────────────── */

const oddOneOut = {
  kind: "odd-one-out",
  source: "vocab",
  generate(w, pool, rng) {
    if (!hasWord(w) || !w.theme) return null;

    const sameTheme = pool.filter(
      (x) => x.id !== w.id && hasWord(x) && x.theme === w.theme,
    );
    if (sameTheme.length < 2) return null;

    const intruder = rng.pick(
      pool.filter((x) => hasWord(x) && x.theme && x.theme !== w.theme),
    );
    if (!intruder) return null;

    const family = [w, ...rng.sample(sameTheme, 2)];
    // Uniquement le hangeul à l'écran : on écarte toute collision d'orthographe
    // entre les 4 options avant de les retenir.
    const options = rng.shuffle(
      dedupeByHangul([...family, intruder]),
    );
    if (options.length < 4) return null;

    return {
      id: uid("odd-one-out", intruder.id, w.id),
      kind: "odd-one-out",
      level: String(w.level),
      prompt: "Quel mot n'appartient pas au même thème ?",
      choices: options.map((x) => x.hangul),
      choicesLang: "ko",
      expected: intruder.hangul,
      lang: "ko",
      explanation: `${intruder.hangul} (${primaryAnswer(intruder.fr)}) relève du thème « ${intruder.theme} », les autres du thème « ${w.theme} ».`,
      tag: w.theme,
      sourceKey: `vocab:${intruder.id}`,
    };
  },
};

function dedupeByHangul(words) {
  const seen = new Set();
  const out = [];
  for (const w of words) {
    const key = normalizeKey(w.hangul);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w);
  }
  return out;
}

/* ───────────────── helpers leçons (grammaire / verbes) ───────────────── */

function lessonExamples(lesson) {
  const raw = lesson?.examples;
  const list = typeof raw === "string" ? safeParse(raw) : raw;
  if (!Array.isArray(list)) return [];
  return list.filter((ex) => ex?.kor?.trim());
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Formes recherchables portées par le titre / la formule d'une leçon.
 * "-아/어요" → ["아요", "어요"] ; "N + 은/는" → ["은", "는"]
 */
function grammarTokens(lesson) {
  const sources = [lesson?.title, lesson?.formula].filter(Boolean);
  const tokens = new Set();

  for (const source of sources) {
    for (const chunk of String(source).split(/[\s+()[\],;·]+/)) {
      for (const piece of chunk.split("/")) {
        const clean = piece.replace(/^[-–—~]+|[-–—~]+$/g, "").trim();
        // On ignore le latin (N, V, A…) et les fragments trop courts
        if (clean.length >= 1 && /[ᄀ-ᇿ㄰-㆏가-힣]/.test(clean)) {
          tokens.add(clean);
        }
      }
    }
  }

  return [...tokens].sort((a, b) => b.length - a.length);
}

const eojeols = (sentence) => String(sentence).trim().split(/\s+/);

/* ───────────────── 5. QCM de grammaire ───────────────── */

const grammarQcm = {
  kind: "grammar-qcm",
  source: "lesson",
  generate(lesson, pool, rng) {
    const answer = lesson?.title?.trim();
    const clue = lesson?.description?.trim();
    if (!answer || !clue) return null;

    const sameSection = pool.filter(
      (l) =>
        l.id !== lesson.id &&
        l.title?.trim() &&
        normalizeKey(l.title) !== normalizeKey(answer) &&
        l.section === lesson.section,
    );
    const others = pool.filter(
      (l) =>
        l.id !== lesson.id &&
        l.title?.trim() &&
        normalizeKey(l.title) !== normalizeKey(answer) &&
        l.section !== lesson.section,
    );

    const seen = new Set([normalizeKey(answer)]);
    const distractors = [];
    for (const l of [...rng.shuffle(sameSection), ...rng.shuffle(others)]) {
      if (distractors.length >= 3) break;
      const key = normalizeKey(l.title);
      if (seen.has(key)) continue;
      seen.add(key);
      distractors.push(l.title.trim());
    }
    if (distractors.length < 3) return null;

    return {
      id: uid("grammar-qcm", lesson.id),
      kind: "grammar-qcm",
      level: String(lesson.level),
      prompt: "Quelle forme correspond à cette règle ?",
      question: clue,
      expected: answer,
      choices: rng.shuffle([answer, ...distractors]),
      choicesLang: "ko",
      lang: "fr",
      explanation: lesson.formula
        ? `Formule : ${lesson.formula}`
        : undefined,
      // Pas de `grammarPoint` ici : pour ce type, il vaudrait la réponse
      // elle-même et se révélerait avant la validation (voir ExerciseCard,
      // qui affiche la forme correcte au-dessus de la question une fois
      // l'exercice corrigé).
      tag: lesson.section || undefined,
      sourceKey: `${lesson.__table}:${lesson.id}`,
    };
  },
};

/* ───────────────── 6. Phrase à trou ───────────────── */

const blankFromExample = {
  kind: "blank-from-example",
  source: "lesson",
  generate(lesson, pool, rng) {
    const examples = lessonExamples(lesson);
    if (!examples.length) return null;

    const tokens = grammarTokens(lesson);

    for (const example of rng.shuffle(examples)) {
      const sentence = String(example.kor).trim();

      // 1) On cherche la forme grammaticale du cours dans la phrase
      const token = tokens.find((t) => t.length >= 1 && sentence.includes(t));
      if (token) {
        const at = sentence.indexOf(token);
        return makeBlank(lesson, example, sentence, at, token);
      }

      // 2) Repli pour les terminaisons verbales : on masque le dernier mot
      if (lesson.__table === "verbes") {
        const parts = eojeols(sentence);
        if (parts.length >= 2) {
          const last = parts[parts.length - 1];
          const at = sentence.lastIndexOf(last);
          return makeBlank(lesson, example, sentence, at, last);
        }
      }
    }

    return null;
  },
};

function makeBlank(lesson, example, sentence, at, answer) {
  const segments = [
    { type: "text", value: sentence.slice(0, at) },
    { type: "blank", index: 0, answer },
    { type: "text", value: sentence.slice(at + answer.length) },
  ].filter((s) => s.type !== "text" || s.value);

  return {
    id: uid("blank-from-example", lesson.id, String(at)),
    kind: "blank-from-example",
    level: String(lesson.level),
    prompt: "Complète la phrase",
    promptSub: example.fr || undefined,
    segments,
    expected: answer,
    lang: "ko",
    hint: lesson.formula || lesson.title || undefined,
    explanation: lesson.description || undefined,
    grammarPoint: lesson.title,
    reveal: sentence,
    tag: lesson.section || undefined,
    sourceKey: `${lesson.__table}:${lesson.id}`,
  };
}

/* ───────────────── 7. Remise en ordre ───────────────── */

const sentenceOrder = {
  kind: "sentence-order",
  source: "lesson",
  generate(lesson, pool, rng) {
    const examples = lessonExamples(lesson).filter((ex) => {
      const n = eojeols(ex.kor).length;
      return n >= 3 && n <= 8;
    });
    if (!examples.length) return null;

    const example = rng.pick(examples);
    const parts = eojeols(example.kor);

    // Un mélange qui rendrait la phrase déjà ordonnée n'a aucun intérêt
    let scrambled = rng.shuffle(parts);
    for (let i = 0; i < 5 && scrambled.join(" ") === parts.join(" "); i++) {
      scrambled = rng.shuffle(parts);
    }
    if (scrambled.join(" ") === parts.join(" ")) return null;

    return {
      id: uid("sentence-order", lesson.id, example.kor.slice(0, 8)),
      kind: "sentence-order",
      level: String(lesson.level),
      prompt: "Remets la phrase dans l'ordre",
      promptSub: example.fr || undefined,
      tokens: scrambled,
      expected: parts.join(" "),
      lang: "ko",
      hint: lesson.title || undefined,
      explanation: lesson.description || undefined,
      grammarPoint: lesson.title,
      tag: lesson.section || undefined,
      sourceKey: `${lesson.__table}:${lesson.id}`,
    };
  },
};

/* ───────────────── helpers vocabulaire × grammaire ───────────────── */

/**
 * `ctx` (fourni par buildSession) :
 *  - lessons  : leçons grammaire + verbes disponibles (filtrées par niveau)
 *  - weightOf : clé de progression → poids de tirage (leçons fragiles d'abord)
 */

/** Tirage pondéré d'un élément. */
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

const ctxWeight = (ctx, key) => (ctx?.weightOf ? ctx.weightOf(key) : 1);
const lessonKey = (l) => `${l.__table}:${l.id}`;

/** Verbe conjugable + leçon de terminaison compatible, ou null. */
function pickConjugation(w, rng, ctx) {
  const pos = verbPos(w);
  if (!pos || !hasWord(w)) return null;
  const verb = analyzeVerb(w.hangul, pos);
  if (!verb) return null;

  const options = [];
  for (const lesson of ctx?.lessons || []) {
    const spec = verbEndingForLesson(lesson);
    const ending = endingFor(spec, pos, verb);
    if (!ending) continue;
    const answer = conjugate(verb, ending);
    if (answer) options.push({ lesson, spec, ending, answer });
  }
  const choice = weightedPick(rng, options, (o) =>
    ctxWeight(ctx, lessonKey(o.lesson)),
  );
  if (!choice) return null;

  const display = verb.prefix ? `${verb.prefix} ${verb.dict}` : verb.dict;
  return { ...choice, verb, display, options };
}

function conjugationCommon(kind, w, c) {
  return {
    id: uid(kind, w.id, c.lesson.id),
    kind,
    level: String(w.level),
    question: c.display,
    questionLang: "ko",
    promptSub: w.fr.trim(),
    grammarPoint: c.lesson.title,
    hint: c.lesson.formula || undefined,
    explanation: c.lesson.description || undefined,
    expected: c.answer,
    lang: "ko",
    tag: c.lesson.section || w.theme || undefined,
    sourceKey: `vocab:${w.id}`,
    // Le mot ET la terminaison progressent (ou reculent) ensemble
    sourceKeys: [`vocab:${w.id}`, lessonKey(c.lesson)],
  };
}

/* ───────────────── 8. Conjugaison (saisie) ───────────────── */

const conjugateInput = {
  kind: "conjugate",
  source: "vocab",
  generate(w, pool, rng, ctx) {
    const c = pickConjugation(w, rng, ctx);
    if (!c) return null;
    return {
      ...conjugationCommon("conjugate", w, c),
      prompt: `Conjugue : ${c.spec.label}`,
      // Saisie : toutes les formes correctes sont acceptées (돼요 / 되어요)
      expected: acceptedForms(c.verb, c.ending).join("/"),
      reveal: c.answer,
    };
  },
};

/* ───────────────── 9. Conjugaison (QCM à pièges) ───────────────── */

const conjugateQcm = {
  kind: "conjugate-qcm",
  source: "vocab",
  generate(w, pool, rng, ctx) {
    const c = pickConjugation(w, rng, ctx);
    if (!c) return null;

    // Pièges d'abord (irrégulier ignoré, 으 oublié…), puis, à défaut, le
    // même verbe à une autre terminaison (tester le sens de la forme).
    const seen = new Set([c.answer]);
    const distractors = [];
    const others = rng
      .shuffle(c.options.filter((o) => o.spec.id !== c.spec.id))
      .map((o) => o.answer);
    for (const form of [...rng.shuffle(commonMistakes(c.verb, c.ending)), ...others]) {
      if (distractors.length >= 3) break;
      if (seen.has(form)) continue;
      seen.add(form);
      distractors.push(form);
    }
    if (distractors.length < 2) return null;

    return {
      ...conjugationCommon("conjugate-qcm", w, c),
      prompt: `Choisis la forme : ${c.spec.label}`,
      choices: rng.shuffle([c.answer, ...distractors]),
      choicesLang: "ko",
    };
  },
};

/* ───────────────── 10. Particule selon le batchim ───────────────── */

const hangulOnly = (s) => /^[가-힣]{1,6}$/.test(String(s || "").trim());

const particle = {
  kind: "particle",
  source: "vocab",
  generate(w, pool, rng, ctx) {
    if (w?.type !== "명사" || !hasWord(w) || !hangulOnly(w.hangul)) return null;
    const noun = w.hangul.trim();

    const options = (ctx?.lessons || [])
      .map((lesson) => ({ lesson, p: particleForLesson(lesson) }))
      .filter((o) => o.p);
    const choice = weightedPick(rng, options, (o) =>
      ctxWeight(ctx, lessonKey(o.lesson)),
    );
    if (!choice) return null;

    const { lesson, p } = choice;
    const answer = attachParticle(noun, p.rule);
    // L'autre variante de la même particule (학생가, 지하철으로)
    const wrongForm =
      answer === noun + p.rule.cons ? noun + p.rule.vowel : noun + p.rule.cons;
    // Une autre particule (bonne et mauvaise forme) : tester aussi la fonction
    const other = rng.pick(options.filter((o) => o.p.id !== p.id));
    const extra = other
      ? [noun + other.p.rule.cons, noun + other.p.rule.vowel]
      : [];

    const seen = new Set([answer]);
    const distractors = [];
    for (const form of [wrongForm, ...extra]) {
      if (!form || seen.has(form)) continue;
      seen.add(form);
      distractors.push(form);
    }
    if (!distractors.length) return null;

    return {
      id: uid("particle", w.id, lesson.id),
      kind: "particle",
      level: String(lesson.level ?? w.level),
      prompt: `Ajoute la bonne particule (${p.label})`,
      promptSub: w.fr.trim(),
      question: `${noun} + ${lesson.title}`,
      questionLang: "ko",
      choices: rng.shuffle([answer, ...distractors]),
      choicesLang: "ko",
      expected: answer,
      lang: "ko",
      hint: lesson.formula || undefined,
      explanation: lesson.formula || lesson.description || undefined,
      tag: lesson.section || undefined,
      sourceKey: lessonKey(lesson),
    };
  },
};

export const GENERATORS = [
  frToKo,
  koToFr,
  matching,
  oddOneOut,
  grammarQcm,
  blankFromExample,
  sentenceOrder,
  conjugateInput,
  conjugateQcm,
  particle,
  sentenceBlanks,
  sentenceBuild,
];

export const GENERATORS_BY_KIND = Object.fromEntries(
  GENERATORS.map((g) => [g.kind, g]),
);

export const VOCAB_KINDS = GENERATORS.filter((g) => g.source === "vocab").map(
  (g) => g.kind,
);

export const LESSON_KINDS = GENERATORS.filter((g) => g.source === "lesson").map(
  (g) => g.kind,
);
