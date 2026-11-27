/**
 * Vérification hors navigateur du moteur d'exercices.
 * Usage : node scripts/smoke-engine.mjs
 */
import { buildSession, ALL_KINDS } from "../src/lib/exercises/buildSession.js";
import { isCorrect } from "../src/lib/normalize.js";
import {
  checkAnswer,
  emptyAnswer,
  progressUpdates,
} from "../src/lib/exercises/check.js";
import {
  mergeStates,
  nextBox,
  recordAnswer,
  reset,
  selectionWeight,
} from "../src/lib/progress.js";
import {
  activityGrid,
  intensity,
  lastDays,
  levelOf,
  xpOf,
} from "../src/lib/dashboard.js";
import {
  diffForServer,
  emptySnapshot,
  rowsToState,
  snapshotOf,
} from "../src/lib/progressRows.js";
import { fromDbRows } from "../src/lib/exercises/fromDb.js";
import { makeRng } from "../src/lib/exercises/rng.js";
import { GENERATORS_BY_KIND } from "../src/lib/exercises/generators.js";
import { conjugate as conjugateRaw } from "../src/lib/conjugate.js";
const conjugateWord = (w, pos) =>
  conjugateRaw(analyzeVerb(w, pos), { base: "aeo", suffix: "요" });
import {
  buildSentence,
  sentenceBlanks,
  sentenceBuild,
} from "../src/lib/exercises/sentences.js";
import { SLOTS, TEMPLATES } from "../src/lib/exercises/templates.js";
import { VERB_ENDINGS } from "../src/lib/exercises/endings.js";
import { analyzeVerb } from "../src/lib/conjugate.js";

const themes = ["Nourriture", "Famille", "Voyage", "École"];
// Vrais mots : les générateurs de conjugaison / particules en ont besoin
const REAL = {
  명사: "학생 친구 책 물 사과 가방 집 버스 손 지하철 우유 시계 의자 커피 빵 꽃".split(" "),
  동사: "먹다 가다 보다 살다 듣다 마시다 공부하다 만들다 읽다 쓰다 오다 배우다 기다리다 놀다 앉다 웃다".split(" "),
  형용사: "춥다 바쁘다 좋다 크다 작다 덥다 많다 예쁘다 빠르다 그렇다 비싸다 싸다 길다 높다 쉽다 어렵다".split(" "),
};
const used = { 명사: 0, 동사: 0, 형용사: 0 };
const vocab = [];
let id = 1;
for (const theme of themes) {
  for (let i = 0; i < 12; i++) {
    const type = i % 3 === 0 ? "명사" : i % 3 === 1 ? "동사" : "형용사";
    vocab.push({
      id: id++,
      hangul: REAL[type][used[type]++],
      fr: `mot ${id}`,
      type: i % 3 === 0 ? "명사" : i % 3 === 1 ? "동사" : "형용사",
      theme,
      level: i % 2 === 0 ? 1 : 2,
      chapitre: Math.ceil(i / 4) + 1,
      partie: (i % 3) + 1,
    });
  }
}

const lessons = [
  {
    id: 1,
    level: 1,
    section: "Particules",
    title: "은/는",
    formula: "N + 은/는",
    description: "Marque le thème de la phrase.",
    examples: [
      { kor: "저는 학생이에요", fr: "Je suis étudiant" },
      { kor: "이것은 책이에요", fr: "Ceci est un livre" },
    ],
  },
  {
    id: 2,
    level: 1,
    section: "Particules",
    title: "이/가",
    formula: "N + 이/가",
    description: "Marque le sujet grammatical.",
    examples: [{ kor: "날씨가 좋아요", fr: "Il fait beau" }],
  },
  {
    id: 3,
    level: 1,
    section: "Particules",
    title: "을/를",
    formula: "N + 을/를",
    description: "Marque le complément d'objet direct.",
    examples: [{ kor: "밥을 먹어요", fr: "Je mange du riz" }],
  },
  {
    id: 4,
    level: 2,
    section: "Particules",
    title: "에서",
    formula: "N + 에서",
    description: "Indique le lieu de l'action.",
    examples: [{ kor: "학교에서 공부해요", fr: "J'étudie à l'école" }],
  },
];

const verbes = [
  {
    id: 10,
    level: 1,
    section: "Présent",
    title: "-아/어요",
    formula: "V + 아/어요",
    description: "Présent poli informel.",
    examples: [{ kor: "저는 매일 학교에 가요", fr: "Je vais à l'école tous les jours" }],
  },
  {
    id: 11,
    level: 1,
    section: "Présent",
    title: "-습니다",
    formula: "V + 습니다",
    description: "Présent poli formel.",
    examples: [{ kor: "감사합니다", fr: "Merci" }],
  },
  {
    id: 12,
    level: 2,
    section: "Passé",
    title: "-았/었어요",
    formula: "V + 았/었어요",
    description: "Passé poli.",
    examples: [{ kor: "어제 영화를 봤어요", fr: "J'ai vu un film hier" }],
  },
  {
    id: 13,
    level: 2,
    section: "Futur",
    title: "-을 거예요",
    formula: "V + 을 거예요",
    description: "Futur / intention.",
    examples: [{ kor: "내일 갈 거예요", fr: "J'irai demain" }],
  },
  { id: 20, level: 1, section: "Désir", title: "-고 싶어요", formula: "V + 고 싶어요", description: "Exprimer un désir.", examples: [] },
];

const dbRows = [
  {
    id: 100,
    level: 1,
    type: "trou",
    title: "Complète avec la bonne particule",
    text: "저___[는]___ 학생이에요.",
    tag: "Particules",
    hint: "Thème de la phrase",
    explanation: "은/는 marque le thème.",
  },
  {
    id: 101,
    level: 1,
    type: "qcm",
    title: "Quelle particule marque le COD ?",
    text: "밥___ 먹어요.",
    choices: JSON.stringify(["을", "이", "에서", "는"]),
    correct_answer: "을",
    tag: "Particules",
  },
];

let failures = 0;
const check = (label, ok, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "OK  " : "FAIL"}  ${label}${extra ? ` — ${extra}` : ""}`);
};

/* ── 1. Adaptateur base de données ── */
const dbExos = fromDbRows(dbRows);
check("fromDbRows produit 2 exercices", dbExos.length === 2);
check(
  "trou parsé correctement",
  dbExos[0].segments.filter((s) => s.type === "blank")[0]?.answer === "는",
);
check("choices JSON string parsé", dbExos[1].choices.length === 4);

/* ── 2. Génération, tous types ── */
const session = buildSession({
  vocab,
  grammaire: lessons,
  verbes,
  dbExercices: dbRows,
  filters: { level: "all" },
  kinds: [...ALL_KINDS, "db-qcm", "db-blanks"],
  count: 40,
  useProgress: false,
  seed: 42,
});

check("session non vide", session.length > 0, `${session.length} exercices`);

const kinds = new Set(session.map((e) => e.kind));
console.log("   types produits :", [...kinds].join(", "));

for (const exo of session) {
  const label = `${exo.kind} (${exo.id})`;

  if (exo.choices) {
    check(`${label} : réponse présente dans les choix`, exo.choices.includes(exo.expected));
    check(
      `${label} : pas de doublon dans les choix`,
      new Set(exo.choices).size === exo.choices.length,
      exo.choices.join(" | "),
    );
    check(`${label} : 4 choix`, exo.choices.length >= 3);
  }
  if (exo.segments) {
    const blanks = exo.segments.filter((s) => s.type === "blank");
    check(`${label} : au moins un trou`, blanks.length > 0);
    check(
      `${label} : trous non vides`,
      blanks.every((b) => b.answer?.trim()),
    );
  }
  if (exo.pairs) {
    check(`${label} : paires >= 3`, exo.pairs.length >= 3);
    check(
      `${label} : traductions distinctes`,
      new Set(exo.pairs.map((p) => p.fr)).size === exo.pairs.length,
    );
  }
  if (exo.tokens) {
    check(
      `${label} : mélange effectif`,
      exo.tokens.join(" ") !== exo.expected,
    );
  }
  if (!exo.pairs && !exo.tokens) {
    check(`${label} : expected défini`, Boolean(exo.expected));
  }
  check(`${label} : sourceKey défini`, Boolean(exo.sourceKey));
}

/* ── 3. Correction ── */
check("FR : casse ignorée", isCorrect("Manger", "manger"));
check("FR : accents ignorés", isCorrect("etudiant", "étudiant"));
check("FR : ponctuation ignorée", isCorrect("manger.", "manger"));
check("FR : article optionnel", isCorrect("maison", "la maison"));
check("FR : alternative acceptée", isCorrect("bouffer", "manger / bouffer"));
check("FR : faux reste faux", !isCorrect("boire", "manger"));
check("KO : espaces normalisés", isCorrect("저는  학생", "저는 학생"));
check("KO : orthographe stricte", !isCorrect("저능 학생", "저는 학생"));
check("vide refusé", !isCorrect("", "manger"));

/* ── 4. Correction d'un exercice complet ── */
const qcm = session.find((e) => e.choices);
if (qcm) {
  const good = checkAnswer(qcm, qcm.expected);
  const bad = checkAnswer(qcm, qcm.choices.find((c) => c !== qcm.expected));
  check("QCM : bonne réponse validée", good.ok);
  check("QCM : mauvaise réponse rejetée", !bad.ok);
}

const order = session.find((e) => e.tokens);
if (order) {
  const good = checkAnswer(order, order.expected.split(" "));
  check("Ordre : phrase correcte validée", good.ok);
}

const match = session.find((e) => e.pairs);
if (match) {
  const answer = Object.fromEntries(match.pairs.map((p) => [p.id, p.fr]));
  check("Appariement : toutes bonnes", checkAnswer(match, answer).ok);
  check("Appariement : état initial vide", Object.keys(emptyAnswer(match)).length === 0);
}

const blanks = session.find((e) => e.segments);
if (blanks) {
  const answer = Object.fromEntries(
    blanks.segments.filter((s) => s.type === "blank").map((b) => [b.index, b.answer]),
  );
  check("Trous : réponses exactes validées", checkAnswer(blanks, answer).ok);
}

/* ── 5. Filtres ── */
const lvl1 = buildSession({
  vocab,
  grammaire: lessons,
  verbes,
  filters: { level: "1" },
  count: 30,
  useProgress: false,
  seed: 7,
});
check(
  "filtre niveau respecté",
  lvl1.every((e) => e.level === "1"),
  [...new Set(lvl1.map((e) => e.level))].join(","),
);

const themed = buildSession({
  vocab,
  filters: { level: "all", theme: "Famille" },
  kinds: ["fr-to-ko", "ko-to-fr"],
  count: 20,
  useProgress: false,
  seed: 3,
});
check("filtre thème produit des exercices", themed.length > 0, `${themed.length}`);

/* ── 6. Chaque générateur produit quelque chose quand il est seul ── */
for (const kind of ALL_KINDS) {
  const only = buildSession({
    vocab,
    grammaire: lessons,
    verbes,
    filters: { level: "all" },
    kinds: [kind],
    count: 5,
    useProgress: false,
    seed: 11,
  });
  check(
    `générateur isolé "${kind}" produit des exercices`,
    only.length > 0 && only.every((e) => e.kind === kind),
    `${only.length}`,
  );
}

/* ── 7. Déterminisme ── */
const a = buildSession({ vocab, filters: {}, count: 10, useProgress: false, seed: 99 });
const b = buildSession({ vocab, filters: {}, count: 10, useProgress: false, seed: 99 });
check(
  "même graine = même session",
  JSON.stringify(a.map((e) => e.id)) === JSON.stringify(b.map((e) => e.id)),
);

/* ── 7a. Contexte d'homonyme facultatif à la saisie ── */
{
  const ctxWord = { id: 950, hangul: "(글을) 쓰다", fr: "écrire", type: "동사", level: 1 };
  const exo = GENERATORS_BY_KIND["fr-to-ko"].generate(ctxWord);
  check("saisie : « 쓰다 » accepté pour « (글을) 쓰다 »", checkAnswer(exo, "쓰다").ok);
  check("saisie : « 글을 쓰다 » accepté", checkAnswer(exo, "글을 쓰다").ok);
  check("saisie : « 읽다 » refusé", !checkAnswer(exo, "읽다").ok);
  check("conjugaison : le contexte est ignoré", conjugateWord("(맛이) 쓰다", "adj") === "써요");
  const slash = GENERATORS_BY_KIND["fr-to-ko"].generate({ id: 951, hangul: "헨드폰/휴대전화", fr: "portable", level: 1 });
  check("saisie : variantes « / » conservées", checkAnswer(slash, "휴대전화").ok && checkAnswer(slash, "헨드폰").ok);
}

/* ── 7b. Homonymes (쓰다 « écrire » / « utiliser » / « amer ») ── */
{
  const homo = [
    { id: 901, hangul: "쓰다", fr: "écrire", type: "동사", theme: "T", level: 1 },
    { id: 902, hangul: "쓰다", fr: "utiliser", type: "동사", theme: "T", level: 1 },
    { id: 903, hangul: "쓰다", fr: "amer", type: "형용사", theme: "T", level: 1 },
    ...["읽다:lire", "보다:voir", "듣다:écouter", "가다:aller", "오다:venir", "먹다:manger"].map((s, i) => {
      const [hangul, fr] = s.split(":");
      return { id: 910 + i, hangul, fr, type: "동사", theme: "T", level: 1 };
    }),
  ];
  let clash = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const qcm = GENERATORS_BY_KIND["ko-to-fr"].generate(homo[0], homo, makeRng(seed));
    if (qcm && (qcm.choices.includes("utiliser") || qcm.choices.includes("amer"))) clash++;
    const m = GENERATORS_BY_KIND.matching.generate(homo[0], homo, makeRng(seed));
    if (m && new Set(m.pairs.map((p) => p.ko)).size !== m.pairs.length) clash++;
  }
  check("homonymes : jamais un autre sens de 쓰다 parmi les choix ni en double", clash === 0, `${clash}`);
}

/* ── 8. Progression : boîtes ── */
check("juste : +1", nextBox(1, true) === 2);
check("juste : plafond 5", nextBox(5, true) === 5);
check("faux : −1 depuis boîte 3", nextBox(3, false) === 2);
check("faux : −2 depuis boîte 5", nextBox(5, false) === 3);
check("faux : −2 depuis boîte 4", nextBox(4, false) === 2);
check("faux : plancher 1", nextBox(1, false) === 1);
check("facile : monte jusqu'à 3", nextBox(2, true, { easy: true }) === 3);
check("facile : bloqué à 3", nextBox(3, true, { easy: true }) === 3);
check("facile : ne fait pas redescendre", nextBox(5, true, { easy: true }) === 5);

/* ── 9. Appariement noté paire par paire ── */
const matchExo = {
  kind: "matching",
  pairs: [
    { id: 1, ko: "가", fr: "a" },
    { id: 2, ko: "나", fr: "b" },
  ],
};
const matchCheck = checkAnswer(matchExo, { 1: "a", 2: "a" });
const updates = progressUpdates(matchExo, matchCheck.ok, matchCheck.detail);
check(
  "appariement : seule la paire ratée est fausse",
  updates.length === 2 && updates[0].ok === true && updates[1].ok === false,
);
check("appariement : compté comme facile", updates.every((u) => u.easy));
check(
  "saisie : pas facile",
  progressUpdates({ kind: "fr-to-ko", sourceKey: "vocab:1" }, true)[0].easy === false,
);

/* ── 10. Tirage pondéré : les mots maîtrisés se font rares ── */
reset();
const masteredIds = vocab.slice(0, 24).map((w) => w.id);
for (const wid of masteredIds) {
  for (let i = 0; i < 5; i++) recordAnswer(`vocab:${wid}`, true);
}
check(
  "mot maîtrisé : poids faible",
  selectionWeight(`vocab:${masteredIds[0]}`) < 0.1 &&
    selectionWeight(`vocab:${vocab[30].id}`) === 1,
);
let masteredSeen = 0;
let total = 0;
for (let s = 0; s < 30; s++) {
  const sess = buildSession({
    vocab,
    kinds: ["fr-to-ko"],
    count: 10,
    seed: 1000 + s,
  });
  total += sess.length;
  masteredSeen += sess.filter((e) =>
    masteredIds.includes(Number(e.sourceKey.split(":")[1])),
  ).length;
}
check(
  "session : ≤ 10 % de mots maîtrisés (moitié du pool)",
  masteredSeen / total <= 0.1,
  `${masteredSeen}/${total}`,
);
const onlyMastered = buildSession({
  vocab: vocab.slice(0, 24),
  kinds: ["fr-to-ko"],
  count: 10,
  seed: 5,
});
check(
  "pool 100 % maîtrisé : session quand même remplie",
  onlyMastered.length === 10,
);
reset();

/* ── 11. Phrases complètes (plusieurs points de grammaire) ── */
const tagged = [
  ...lessons.map((l) => ({ ...l, __table: "grammaire" })),
  ...verbes.map((l) => ({ ...l, __table: "verbes" })),
];
const bread = vocab.find((w) => w.hangul === "빵");
const wantEat = TEMPLATES.find((t) => t.id === "want-eat");
const built = buildSentence(wantEat, bread, { lessons: tagged, vocab }, makeRng(1));
check(
  "phrase : 집에서 빵을 먹고 싶어요",
  built?.sentence === "집에서 빵을 먹고 싶어요",
  built?.sentence,
);
check(
  "phrase : 3 points de grammaire",
  built?.labels.length === 3,
  built?.labels.join(" · "),
);
check(
  "phrase : leçon manquante → pas d'exercice",
  buildSentence(wantEat, bread, { lessons: [], vocab }, makeRng(1)) === null,
);

const blanksExo = sentenceBlanks.generate(bread, vocab, makeRng(2), {
  lessons: tagged,
  vocab,
});
check("phrase à trous : 3 trous", blanksExo?.expected.length === 3);
const partial = checkAnswer(blanksExo, { 0: "에서", 1: "를", 2: "먹고 싶어요" });
const partialUpdates = progressUpdates(blanksExo, partial.ok, partial.detail);
const upd = Object.fromEntries(partialUpdates.map((u) => [u.key, u.ok]));
check(
  "phrase à trous : seule la particule ratée recule",
  partial.ok === false &&
    upd["grammaire:4"] === true &&
    upd["grammaire:3"] === false &&
    upd["verbes:20"] === true,
  JSON.stringify(upd),
);
check(
  "phrase à construire : ponctuation finale tolérée",
  checkAnswer(
    sentenceBuild.generate(bread, vocab, makeRng(3), { lessons: tagged, vocab }),
    "집에서 빵을 먹고 싶어요.",
  ).ok,
);

/* ── 12. Modèles de phrases : références valides ── */
for (const t of TEMPLATES) {
  const problems = [];
  for (const part of t.parts) {
    if (part.slot && !SLOTS[part.slot]) problems.push(`liste ${part.slot}`);
    if (part.verbSlot && !SLOTS[part.verbSlot])
      problems.push(`liste ${part.verbSlot}`);
    if (part.slot && !part.g) problems.push(`particule manquante (${part.slot})`);
    if (
      typeof part.ending === "string" &&
      !VERB_ENDINGS.some((s) => s.id === part.ending)
    )
      problems.push(`terminaison ${part.ending}`);
    if (part.verb && !analyzeVerb(part.verb, part.pos || "verb"))
      problems.push(`verbe ${part.verb}`);
    for (const v of part.verbSlot ? SLOTS[part.verbSlot] || [] : [])
      if (!analyzeVerb(v, "verb")) problems.push(`verbe ${v}`);
    if (part.after && !t.parts.some((x) => (x.as || x.slot) === part.after))
      problems.push(`after ${part.after}`);
  }
  for (const name of t.fr.match(/\{(\w+)\}/g) || []) {
    const key = name.slice(1, -1);
    if (!t.parts.some((x) => (x.as || x.slot || x.verbSlot) === key))
      problems.push(`fr ${name}`);
  }
  check(`modèle ${t.id} : références valides`, problems.length === 0, problems.join(", "));
}
check("identifiants de modèles uniques", new Set(TEMPLATES.map((t) => t.id)).size === TEMPLATES.length);

/* ── 13. Fusion de progression (invité / appareils / serveur) ── */
const devA = {
  items: {
    "vocab:1": { seen: 3, correct: 3, wrong: 0, box: 4, lastSeen: 200 },
    "vocab:2": { seen: 1, correct: 0, wrong: 1, box: 1, lastSeen: 100 },
  },
  streak: { current: 2, best: 5, lastDay: "2026-11-20" },
  history: [{ day: "2026-11-20", count: 10, score: 8 }],
};
const devB = {
  items: {
    "vocab:1": { seen: 2, correct: 2, wrong: 0, box: 3, lastSeen: 150 },
    "vocab:2": { seen: 2, correct: 1, wrong: 1, box: 2, lastSeen: 300 },
    "vocab:3": { seen: 1, correct: 1, wrong: 0, box: 2, lastSeen: 50 },
  },
  streak: { current: 4, best: 4, lastDay: "2026-11-22" },
  history: [
    { day: "2026-11-20", count: 6, score: 6 },
    { day: "2026-11-22", count: 15, score: 12 },
  ],
};
const merged = mergeStates(devA, devB);
check("fusion : entrée la plus récente gagne", merged.items["vocab:1"].box === 4 && merged.items["vocab:2"].box === 2);
check("fusion : union des clés", Object.keys(merged.items).length === 3);
check("fusion : série la plus récente, record max", merged.streak.current === 4 && merged.streak.best === 5);
check("fusion : historique par jour sans doublon", merged.history.length === 2 && merged.history[0].count === 10);
check("fusion : idempotente", JSON.stringify(mergeStates(merged, devB)) === JSON.stringify(merged));
check("fusion : état vide accepté", Object.keys(mergeStates(null, devA).items).length === 2);

/* ── 14. Tableau de bord ── */
check("niveau 1 à 0 XP", levelOf(0).level === 1 && levelOf(0).pct === 0);
check("niveau 2 à 100 XP", levelOf(100).level === 2);
check("XP : 10/bonne réponse + 25/maîtrisé", xpOf({ items: { a: { correct: 3, box: 5 } } }) === 55);
const grid = activityGrid([{ day: new Date().toISOString().slice(0, 10), count: 7, score: 5 }], 15);
check("activité : 15 semaines", grid.cells.length === 105 && grid.max === 7);
check("activité : aujourd'hui compté", grid.cells.some((c) => c.count === 7 && !c.future));
check("intensité 0 → 4", intensity(0, 10) === 0 && intensity(10, 10) === 4 && intensity(1, 10) === 1);
check("14 derniers jours", lastDays([], 14).length === 14);

/* ── 15. Lignes Supabase ↔ état local ── */
const rows = {
  items: [
    { item_key: "vocab:1", box: 3, seen: 4, correct: 3, wrong: 1, last_seen: "2026-11-20T10:00:00.123+00:00" },
    { item_key: "verbes:2", box: 1, seen: 1, correct: 0, wrong: 1, last_seen: null },
  ],
  stats: { streak_current: 3, streak_best: 7, last_day: "2026-11-20" },
  history: [{ day: "2026-11-20", count: 12, score: 9 }],
};
const fromRows = rowsToState(rows);
check(
  "lignes → état : horodatage en ms exact",
  fromRows.items["vocab:1"].lastSeen === Date.parse("2026-11-20T10:00:00.123Z"),
);
check("lignes → état : série", fromRows.streak.best === 7 && fromRows.streak.lastDay === "2026-11-20");
const snap = snapshotOf(fromRows);
const unchanged = diffForServer(fromRows, snap);
check(
  "diff : rien à envoyer si identique",
  !unchanged.items.length && !unchanged.history.length && !unchanged.stats,
);
const changed = {
  ...fromRows,
  items: { ...fromRows.items, "vocab:1": { ...fromRows.items["vocab:1"], box: 4 }, "vocab:9": { box: 2, seen: 1, correct: 1, wrong: 0, lastSeen: 5 } },
  history: [...fromRows.history, { day: "2026-11-21", count: 3, score: 3 }],
};
const d = diffForServer(changed, snap);
check(
  "diff : seulement les lignes modifiées",
  d.items.map((i) => i.key).sort().join() === "vocab:1,vocab:9" &&
    d.history.length === 1 &&
    d.stats === null,
);
check("diff : premier envoi = tout", diffForServer(fromRows, emptySnapshot()).items.length === 2);

console.log(
  failures === 0
    ? "\n✅ Toutes les vérifications passent."
    : `\n❌ ${failures} vérification(s) en échec.`,
);
process.exit(failures === 0 ? 0 : 1);
