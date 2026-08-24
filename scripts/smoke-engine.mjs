/**
 * Vérification hors navigateur du moteur d'exercices.
 * Usage : node scripts/smoke-engine.mjs
 */
import { buildSession, ALL_KINDS } from "../src/lib/exercises/buildSession.js";
import { isCorrect } from "../src/lib/normalize.js";
import { checkAnswer, emptyAnswer } from "../src/lib/exercises/check.js";
import { fromDbRows } from "../src/lib/exercises/fromDb.js";

const themes = ["Nourriture", "Famille", "Voyage", "École"];
const vocab = [];
let id = 1;
for (const theme of themes) {
  for (let i = 0; i < 12; i++) {
    vocab.push({
      id: id++,
      hangul: `단어${id}`,
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

console.log(
  failures === 0
    ? "\n✅ Toutes les vérifications passent."
    : `\n❌ ${failures} vérification(s) en échec.`,
);
process.exit(failures === 0 ? 0 : 1);
