import { composeSyllable, decomposeSyllable } from "./hangul";

/**
 * Moteur de conjugaison coréen, déterministe et sans dépendance.
 *
 * Trois familles de terminaisons couvrent la quasi-totalité des leçons :
 *  - "plain" : collée au radical          (먹 + 고 싶어요 → 먹고 싶어요)
 *  - "eu"    : -(으)…, 으 après consonne  (먹 + (으)세요 → 먹으세요)
 *  - "aeo"   : -아/어…, harmonie vocalique (먹 + 아/어요 → 먹어요)
 * plus "seumnida" (-습니다 / -ㅂ니다).
 *
 * Un suffixe peut commencer par un jamo (ㄴ, ㄹ, ㅂ, ㅆ) : il se colle alors
 * en batchim de la syllabe précédente (가 + ㄹ 거예요 → 갈 거예요).
 *
 * Les irréguliers sont reconnus par liste quand la règle de surface est
 * ambiguë (ㅂ, ㄷ, ㅅ, ㅎ). Un verbe dont on ne peut pas garantir la
 * conjugaison renvoie null : mieux vaut ne pas générer d'exercice qu'un
 * exercice faux.
 */

/* ───────────────── Listes d'irréguliers ───────────────── */

// Verbes ㅂ irréguliers (les adjectifs en ㅂ le sont presque tous par défaut)
const IRREG_B = ["돕다", "곱다", "눕다", "줍다", "깁다"];
const REG_B = ["입다", "잡다", "좁다", "씹다", "뽑다", "업다", "접다", "집다", "넓다"];
const B_WA = ["돕다", "곱다"]; // ㅂ → 와 (et non 워)

const IRREG_D = ["듣다", "걷다", "싣다", "깨닫다", "붇다", "일컫다"];
const REG_D = ["받다", "닫다", "믿다", "얻다", "쏟다", "뜯다", "돋다"];

const IRREG_S = ["낫다", "짓다", "붓다", "긋다", "잇다", "젓다"];
const REG_S = ["웃다", "씻다", "벗다", "빼앗다", "솟다", "빗다"];

// ㅎ final régulier (les autres adjectifs en ㅎ sont irréguliers)
const REG_H = ["좋다", "놓다", "넣다", "낳다", "닿다", "쌓다"];

// Radicaux en 르 qui suivent la règle « 으 tombe » et non « 르 irrégulier »
const REG_REU = ["따르다", "치르다", "들르다"];

// Trop ambigus (ou trop irréguliers) pour être conjugués automatiquement ;
// comparés à la forme exacte, pas en suffixe (보이다 ≠ 이다).
const AMBIGUOUS = ["묻다", "굽다", "이르다", "이다", "아니다", "뵙다"];

/**
 * Homonymes dont la conjugaison dépend du sens : le contexte entre
 * parenthèses (« (길을) 묻다 ») permet de trancher. Renvoie la classe
 * de radical, ou null si le contexte ne suffit pas.
 */
const DISAMBIGUATE = {
  // demander : ㄷ irrégulier (물어요) / être taché, enterrer : régulier (묻어요)
  묻다: (ctx) =>
    /길|질문|물어|안부|이름|의견/.test(ctx) ? "d" : /얼룩|흙|때|땅/.test(ctx) ? "cons" : null,
  // griller : ㅂ irrégulier (구워요) / se courber : régulier (굽어요)
  굽다: (ctx) =>
    /고기|빵|생선|요리|불/.test(ctx) ? "b" : /허리|등|길이/.test(ctx) ? "cons" : null,
};

const endsWithAny = (word, list) =>
  list.some((x) => word === x || word.endsWith(x));

/* ───────────────── Contrôle de l'action ─────────────────
   Certaines terminaisons supposent une action voulue (impératif, désir,
   promesse…) : « 다치고 싶어요 », « 배송되세요 » n'ont pas de sens.
     full     action volontaire : toutes les terminaisons
     emotion  émotion / accident : seulement l'interdiction
              (« 긴장하지 마세요 », « 넘어지지 마세요 » sont naturels)
     none     passif, perception, sujet exprimé : aucune des deux */
const NO_CONTROL = ["보이다", "들리다", "생기다", "오래되다", "붓다"];
const EMOTION_OR_ACCIDENT = [
  "놀라다", "당황하다", "실망하다", "긴장하다", "감동하다",
  "다치다", "죽다", "졸다", "잃어버리다",
];
// Ne se mettent pas au progressif -고 있어요 (état, perception)
const STATIVE = ["오래되다", "보이다", "들리다"];
// Volontaires, mais l'interdiction n'a pas de sens (« 낫지 마세요 »)
const NO_PROHIBITION = ["낫다"];
// Adverbes en -이 qui ne sont pas des sujets (« 같이 가다 »)
const ADVERBS_I = ["같이", "많이", "깊이", "높이", "깨끗이", "천천히"];

function controlOf(dict, hasSubject) {
  if (hasSubject) return "none";
  if (NO_CONTROL.includes(dict)) return "none";
  if (dict.length > 2 && dict.endsWith("되다")) return "none"; // 배송되다, 오염되다
  if (EMOTION_OR_ACCIDENT.includes(dict)) return "emotion";
  if (/(어|아|여|러)지다$|깨지다$/.test(dict)) return "emotion"; // 넘어지다, 깨지다
  return "full";
}

/* ───────────────── Helpers syllabes ───────────────── */

const JAMO_FINALS = new Set(["ㄴ", "ㄹ", "ㅂ", "ㅆ", "ㅁ"]);

const last = (s) => decomposeSyllable(s.at(-1));

function replaceLast(s, { i, m, f }) {
  const d = last(s);
  return s.slice(0, -1) + composeSyllable(i ?? d.i, m ?? d.m, f ?? d.f);
}

/** Première consonne d'un suffixe (jamo isolé ou initiale de syllabe). */
function firstConsonant(suffix) {
  const c = suffix[0];
  if (JAMO_FINALS.has(c)) return c;
  const d = decomposeSyllable(c);
  return d ? d.i : null;
}

/** Colle un suffixe ; un jamo initial devient batchim de la syllabe d'avant. */
function join(base, suffix) {
  if (!suffix) return base;
  const c = suffix[0];
  if (!JAMO_FINALS.has(c)) return base + suffix;
  const d = last(base);
  if (d.f === c) return base + suffix.slice(1); // 살 + ㄹ → 살
  if (d.f) return base + suffix; // ne devrait pas arriver
  return replaceLast(base, { f: c }) + suffix.slice(1);
}

const bright = (m) => m === "ㅏ" || m === "ㅗ" || m === "ㅑ";

/* ───────────────── Analyse du radical ───────────────── */

/**
 * Prépare un mot du dictionnaire (« 먹다 », « 사진을 찍다 ») pour la
 * conjugaison.
 *
 * @param {string} word forme du dictionnaire
 * @param {"verb"|"adj"} pos
 * @returns {{ prefix: string, stem: string, cls: string, pos: string, dict: string } | null}
 */
export function analyzeVerb(word, pos = "verb") {
  // « (파일을) 저장하다 » : le contexte entre parenthèses n'est pas conjugué,
  // mais il peut lever l'ambiguïté d'un homonyme (« (길을) 묻다 »)
  const context = (String(word || "").match(/\(([^)]*)\)/g) || []).join(" ");
  const clean = String(word || "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/^[가-힣]+( [가-힣]+)*$/.test(clean)) return null;

  const words = clean.split(" ");
  const dict = words.at(-1);
  const prefix = words.slice(0, -1).join(" ");
  if (dict.length < 2 || !dict.endsWith("다")) return null;
  const resolved = DISAMBIGUATE[dict]?.(`${context} ${prefix}`) ?? null;
  if (AMBIGUOUS.includes(dict) && !resolved) return null;
  // Nom + 이다 (다행이다) : copule, pas un adjectif à conjuguer ici
  if (pos === "adj" && dict.endsWith("이다")) return null;

  const stem = dict.slice(0, -1);
  const d = last(stem);
  if (!d) return null;

  let cls;
  if (resolved) cls = resolved;
  else if (stem.endsWith("하")) cls = "ha";
  else if (d.f === "ㄹ") cls = "l";
  else if (d.f === "ㅂ") {
    if (endsWithAny(dict, IRREG_B)) cls = "b";
    else if (endsWithAny(dict, REG_B)) cls = "cons";
    else if (pos === "adj") cls = "b";
    else return null;
  } else if (d.f === "ㄷ") {
    if (endsWithAny(dict, IRREG_D)) cls = "d";
    else if (endsWithAny(dict, REG_D)) cls = "cons";
    else return null;
  } else if (d.f === "ㅅ") {
    if (endsWithAny(dict, IRREG_S)) cls = "s";
    else if (endsWithAny(dict, REG_S)) cls = "cons";
    else return null;
  } else if (d.f === "ㅎ") {
    if (endsWithAny(dict, REG_H)) cls = "cons";
    else if (pos === "adj") cls = "h";
    else return null;
  } else if (d.f) cls = "cons";
  else if (d.m === "ㅡ") {
    cls =
      stem.length >= 2 && d.i === "ㄹ" && !endsWithAny(dict, REG_REU)
        ? "reu"
        : "eu";
  } else cls = "vowel";

  // « 살이 찌다 », « 해가 지다 » : sujet non humain, pas d'impératif possible
  // (n'importe quel mot avant le verbe : « 소화가 안 되다 »)
  // (y compris dans le contexte entre parenthèses : « (얼룩이) 묻다 »)
  const contextWords = context.replace(/[()]/g, " ").split(/\s+/).filter(Boolean);
  const hasSubject = [...words.slice(0, -1), ...contextWords].some(
    (w) => /[이가]$/.test(w) && !ADVERBS_I.includes(w),
  );

  return {
    prefix,
    stem,
    cls,
    pos,
    dict,
    hasSubject,
    control: controlOf(dict, hasSubject),
    stative: STATIVE.includes(dict),
    noProhibition: NO_PROHIBITION.includes(dict),
    // 있다 / 없다 (et 맛있다, 재미없다…) prennent -는 comme les verbes :
    // 재미있는데, 맛있는 편이에요 — jamais *재미있은데
    takesNeun: /[있없]다$/.test(dict),
  };
}

/**
 * Variantes également correctes d'une forme (acceptées en saisie).
 * 되 + 어 : « 돼요 » (courant) et « 되어요 » (complet) sont justes tous deux.
 */
export function acceptedForms(verb, ending) {
  const main = conjugate(verb, ending);
  if (!main) return [];
  const forms = [main];
  if (ending.base === "aeo" && verb.cls === "vowel" && last(verb.stem).m === "ㅚ") {
    const full = join(verb.stem + "어", ending.suffix);
    forms.push(verb.prefix ? `${verb.prefix} ${full}` : full);
  }
  return forms;
}

/* ───────────────── Formes de base ───────────────── */

/** Forme en -아/어 (sans 요) : 먹어, 가, 해, 추워, 들어, 나아, 그래, 몰라, 써. */
export function aeoForm({ stem, cls, dict }) {
  const d = last(stem);
  switch (cls) {
    case "ha":
      return stem.slice(0, -1) + "해";
    case "b": {
      const base = replaceLast(stem, { f: "" });
      return base + (endsWithAny(dict, B_WA) ? "와" : "워");
    }
    case "d":
      return replaceLast(stem, { f: "ㄹ" }) + (bright(d.m) ? "아" : "어");
    case "s":
      return replaceLast(stem, { f: "" }) + (bright(d.m) ? "아" : "어");
    case "h": {
      const m = d.m === "ㅑ" ? "ㅒ" : "ㅐ";
      return replaceLast(stem, { m, f: "" });
    }
    case "reu": {
      const before = stem.slice(0, -1);
      const p = last(before);
      const withL = replaceLast(before, { f: "ㄹ" });
      return withL + (bright(p.m) ? "라" : "러");
    }
    case "eu": {
      if (stem.length === 1) return replaceLast(stem, { m: "ㅓ" });
      const p = last(stem.slice(0, -1));
      return replaceLast(stem, { m: bright(p.m) ? "ㅏ" : "ㅓ" });
    }
    case "vowel": {
      const contract = {
        ㅏ: "ㅏ", ㅓ: "ㅓ", ㅕ: "ㅕ", ㅐ: "ㅐ", ㅔ: "ㅔ",
        ㅗ: "ㅘ", ㅜ: "ㅝ", ㅣ: "ㅕ", ㅚ: "ㅙ", ㅘ: "ㅘ", ㅝ: "ㅝ",
      }[d.m];
      if (contract) return replaceLast(stem, { m: contract });
      return stem + (bright(d.m) ? "아" : "어");
    }
    default: // cons, l
      return stem + (bright(d.m) ? "아" : "어");
  }
}

/** Radical devant -(으)… : ajoute 으 si besoin et gère ㄹ / irréguliers. */
function euJoin({ stem, cls }, suffix) {
  const c = firstConsonant(suffix);
  switch (cls) {
    case "l":
      if (c === "ㄴ" || c === "ㅂ" || c === "ㅅ")
        return join(replaceLast(stem, { f: "" }), suffix);
      return join(stem, suffix); // 살면, 살 거예요, 살러
    case "b":
      return join(replaceLast(stem, { f: "" }) + "우", suffix);
    case "d":
      return replaceLast(stem, { f: "ㄹ" }) + join("으", suffix);
    case "s":
      return replaceLast(stem, { f: "" }) + join("으", suffix);
    case "h":
      return join(replaceLast(stem, { f: "" }), suffix);
    case "cons":
      return stem + join("으", suffix);
    default: // ha, vowel, eu, reu
      return join(stem, suffix);
  }
}

function plainJoin({ stem, cls }, suffix) {
  const c = firstConsonant(suffix);
  if (cls === "l" && (c === "ㄴ" || c === "ㅂ" || c === "ㅅ"))
    return replaceLast(stem, { f: "" }) + suffix; // 사는, 사네요
  return stem + suffix;
}

function seumnida({ stem, cls }) {
  if (cls === "l") return join(replaceLast(stem, { f: "" }), "ㅂ니다");
  return last(stem).f ? stem + "습니다" : join(stem, "ㅂ니다");
}

/* ───────────────── API ───────────────── */

/**
 * Conjugue un verbe analysé selon une terminaison.
 * @param {ReturnType<typeof analyzeVerb>} verb
 * @param {{ base: "plain"|"eu"|"aeo"|"seumnida", suffix?: string }} ending
 * @returns {string|null}
 */
export function conjugate(verb, ending) {
  if (!verb || !ending) return null;
  let out;
  switch (ending.base) {
    case "plain":
      out = plainJoin(verb, ending.suffix);
      break;
    case "eu":
      out = euJoin(verb, ending.suffix);
      break;
    case "aeo":
      out = join(aeoForm(verb), ending.suffix);
      break;
    case "seumnida":
      out = seumnida(verb);
      break;
    default:
      return null;
  }
  return verb.prefix ? `${verb.prefix} ${out}` : out;
}

/**
 * Formes fautives plausibles, pour les QCM : irrégulier ignoré, 으 oublié
 * ou en trop, ㄹ non élidé, mauvaise harmonie, contraction oubliée.
 * Aucune ne vaut la bonne réponse.
 */
export function commonMistakes(verb, ending) {
  if (!verb || !ending) return [];
  const right = conjugate(verb, ending);
  const out = new Set();
  const add = (form) => {
    if (!form) return;
    const full = verb.prefix ? `${verb.prefix} ${form}` : form;
    if (full !== right) out.add(full);
  };
  const { stem, cls } = verb;
  const d = last(stem);
  const { base, suffix } = ending;

  // Irrégulier traité comme régulier : 춥어요, 듣으면, 낫아요, 모르어요
  if (["b", "d", "s", "h", "reu"].includes(cls)) {
    const regular = { ...verb, cls: cls === "reu" ? "vowel" : "cons" };
    if (base === "aeo") add(join(stem + (bright(d.m) ? "아" : "어"), suffix));
    else add(conjugate({ ...regular, prefix: "" }, ending));
  }

  if (base === "eu") {
    const c = firstConsonant(suffix);
    if (d.f && cls !== "l") add(stem + (JAMO_FINALS.has(suffix[0]) ? suffix.slice(1) : suffix)); // 먹세요
    if (!d.f) add(stem + join("으", suffix)); // 가으세요
    if (cls === "l") {
      add(stem + join("으", suffix)); // 살으면
      if (c === "ㄴ" || c === "ㅂ" || c === "ㅅ") add(stem + (JAMO_FINALS.has(suffix[0]) ? suffix.slice(1) : suffix)); // 살세요
    }
  }

  if (base === "plain") {
    if (cls === "l") add(stem + suffix); // 살는
    if (d.f && cls !== "l") add(stem + "으" + suffix); // 먹으고
  }

  if (base === "aeo") {
    const flipped = stem + (bright(d.m) ? "어" : "아");
    if (cls === "cons" || cls === "l") add(join(flipped, suffix)); // 먹아요
    if (cls === "vowel" && (d.m === "ㅏ" || d.m === "ㅓ"))
      add(join(stem + (d.m === "ㅏ" ? "아" : "어"), suffix)); // 가아요
    add(plainJoin(verb, stripJamo(suffix))); // 먹요, 먹서
  }

  if (base === "seumnida") {
    if (!d.f) add(stem + "습니다"); // 가습니다
    if (cls === "l") add(stem + "습니다"); // 살습니다
    if (d.f && cls !== "l") add(stem + "읍니다"); // 먹읍니다
  }

  return [...out].filter((f) => /^[가-힣 ?]+$/.test(f));
}

/** Retire un jamo initial (ㅆ…) d'un suffixe. */
function stripJamo(suffix) {
  if (!suffix || !JAMO_FINALS.has(suffix[0])) return suffix || "";
  return suffix.slice(1);
}

/* ───────────────── Particules ───────────────── */

/** Le nom se termine-t-il par une consonne (batchim) ? */
export function hasBatchim(word) {
  const d = last(String(word || "").trim());
  return Boolean(d && d.f);
}

/**
 * Particule alternante selon le batchim.
 * @param {string} noun
 * @param {{ cons: string, vowel: string, lAsVowel?: boolean }} rule
 */
export function attachParticle(noun, { cons, vowel, lAsVowel = false }) {
  const d = last(noun);
  if (!d) return null;
  const useVowel = !d.f || (lAsVowel && d.f === "ㄹ");
  return noun + (useVowel ? vowel : cons);
}
