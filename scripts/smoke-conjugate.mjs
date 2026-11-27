/**
 * Vérification hors navigateur du moteur de conjugaison.
 * Usage : node node_modules/esbuild/bin/esbuild scripts/smoke-conjugate.mjs --bundle --platform=node --format=esm --outfile=node_modules/.tmp-smoke-conj.mjs && node node_modules/.tmp-smoke-conj.mjs
 */
import {
  acceptedForms,
  analyzeVerb,
  attachParticle,
  commonMistakes,
  conjugate,
} from "../src/lib/conjugate.js";
import { VERB_ENDINGS, endingFor } from "../src/lib/exercises/endings.js";

let failures = 0;
const check = (label, ok, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "OK  " : "FAIL"}  ${label}${extra ? ` — ${extra}` : ""}`);
};

const E = {
  present: { base: "aeo", suffix: "요" },
  past: { base: "aeo", suffix: "ㅆ어요" },
  seyo: { base: "eu", suffix: "세요" },
  myeon: { base: "eu", suffix: "면" },
  future: { base: "eu", suffix: "ㄹ 거예요" },
  after: { base: "eu", suffix: "ㄴ 다음에" },
  letsgo: { base: "eu", suffix: "ㅂ시다" },
  want: { base: "plain", suffix: "고 싶어요" },
  neun: { base: "plain", suffix: "는 동안" },
  formal: { base: "seumnida" },
  give: { base: "aeo", suffix: " 주세요" },
};

// [mot, nature, terminaison, attendu]
const cases = [
  ["먹다", "verb", "present", "먹어요"],
  ["가다", "verb", "present", "가요"],
  ["오다", "verb", "present", "와요"],
  ["보다", "verb", "past", "봤어요"],
  ["주다", "verb", "present", "줘요"],
  ["마시다", "verb", "past", "마셨어요"],
  ["되다", "verb", "present", "돼요"],
  ["쉬다", "verb", "present", "쉬어요"],
  ["보내다", "verb", "present", "보내요"],
  ["켜다", "verb", "past", "켰어요"],
  ["공부하다", "verb", "past", "공부했어요"],
  ["사진을 찍다", "verb", "present", "사진을 찍어요"],
  ["쓰다", "verb", "present", "써요"],
  ["바쁘다", "adj", "present", "바빠요"],
  ["예쁘다", "adj", "past", "예뻤어요"],
  ["모르다", "verb", "present", "몰라요"],
  ["부르다", "verb", "past", "불렀어요"],
  ["빠르다", "adj", "present", "빨라요"],
  ["따르다", "verb", "present", "따라요"],
  ["춥다", "adj", "present", "추워요"],
  ["돕다", "verb", "present", "도와요"],
  ["춥다", "adj", "myeon", "추우면"],
  ["어렵다", "adj", "future", "어려울 거예요"],
  ["입다", "verb", "present", "입어요"],
  ["듣다", "verb", "present", "들어요"],
  ["걷다", "verb", "seyo", "걸으세요"],
  ["듣다", "verb", "future", "들을 거예요"],
  ["받다", "verb", "present", "받아요"],
  ["낫다", "verb", "present", "나아요"],
  ["짓다", "verb", "myeon", "지으면"],
  ["웃다", "verb", "present", "웃어요"],
  ["그렇다", "adj", "present", "그래요"],
  ["하얗다", "adj", "present", "하얘요"],
  ["빨갛다", "adj", "myeon", "빨가면"],
  ["좋다", "adj", "present", "좋아요"],
  ["살다", "verb", "present", "살아요"],
  ["살다", "verb", "seyo", "사세요"],
  ["살다", "verb", "myeon", "살면"],
  ["살다", "verb", "future", "살 거예요"],
  ["놀다", "verb", "letsgo", "놉시다"],
  ["만들다", "verb", "neun", "만드는 동안"],
  ["만들다", "verb", "formal", "만듭니다"],
  ["먹다", "verb", "formal", "먹습니다"],
  ["가다", "verb", "formal", "갑니다"],
  ["먹다", "verb", "seyo", "먹으세요"],
  ["가다", "verb", "future", "갈 거예요"],
  ["먹다", "verb", "after", "먹은 다음에"],
  ["가다", "verb", "after", "간 다음에"],
  ["먹다", "verb", "letsgo", "먹읍시다"],
  ["먹다", "verb", "want", "먹고 싶어요"],
  ["기다리다", "verb", "give", "기다려 주세요"],
  ["있다", "verb", "present", "있어요"],
];

for (const [word, pos, ending, expected] of cases) {
  const got = conjugate(analyzeVerb(word, pos), E[ending]);
  check(`${word} + ${ending} = ${expected}`, got === expected, got);
}

// Mots refusés (ambigus ou non verbaux)
for (const w of ["묻다", "주문하기", "가다 / 오다", "Hello", "뵙다"]) {
  check(`refusé : ${w}`, analyzeVerb(w) === null);
}
check("refusé : copule 다행이다 (adj)", analyzeVerb("다행이다", "adj") === null);
check("accepté : 보이다 (verbe en -이다)", conjugate(analyzeVerb("보이다"), E.present) === "보여요");
check("contexte entre parenthèses ignoré", conjugate(analyzeVerb("(파일을) 저장하다"), E.past) === "저장했어요");
check("sujet exprimé détecté", analyzeVerb("살이 찌다").hasSubject === true);
check("ㅂ verbe inconnu refusé", analyzeVerb("뇹다", "verb") === null);

// Pièges : jamais la bonne réponse, et quelques classiques présents
const trapCases = [
  ["춥다", "adj", "present", "춥어요"],
  ["먹다", "verb", "seyo", "먹세요"],
  ["가다", "verb", "seyo", "가으세요"],
  ["살다", "verb", "seyo", "살으세요"],
  ["먹다", "verb", "present", "먹아요"],
  ["가다", "verb", "present", "가아요"],
  ["듣다", "verb", "present", "듣어요"],
];
for (const [word, pos, ending, trap] of trapCases) {
  const v = analyzeVerb(word, pos);
  const traps = commonMistakes(v, E[ending]);
  check(
    `piège ${trap} pour ${word}`,
    traps.includes(trap) && !traps.includes(conjugate(v, E[ending])),
    traps.join(", "),
  );
}

// Nature du verbe × terminaison
const spec = (id) => VERB_ENDINGS.find((s) => s.id === id);
const form = (word, pos, id) => {
  const v = analyzeVerb(word, pos);
  const e = endingFor(spec(id), pos, v);
  return e ? conjugate(v, e) : null;
};
check("있다-adjectif + -는데 : 재미있는데", form("재미있다", "adj", "nde") === "재미있는데", form("재미있다", "adj", "nde"));
check("있다-adjectif + 편 : 맛있는 편이에요", form("맛있다", "adj", "pyeon") === "맛있는 편이에요");
check("없다-adjectif + 것 같다 : 재미없는 것 같아요", form("재미없다", "adj", "geot-gatda-1") === "재미없는 것 같아요");
check("adjectif normal + -(으)ㄴ데 : 추운데", form("춥다", "adj", "nde") === "추운데");
check("verbe + -는데 : 먹는데", form("먹다", "verb", "nde") === "먹는데");
check("accident : pas de désir (다치고 싶어요)", form("다치다", "verb", "go-sipeoyo") === null);
check("accident : interdiction OK (다치지 마세요)", form("다치다", "verb", "ji-maseyo") === "다치지 마세요");
check("émotion : interdiction OK (긴장하지 마세요)", form("긴장하다", "verb", "ji-maseyo") === "긴장하지 마세요");
check("émotion : pas d'impératif (긴장하세요)", form("긴장하다", "verb", "seyo") === null);
check("passif -되다 : pas d'interdiction (배송되지 마세요)", form("배송되다", "verb", "ji-maseyo") === null);
check("passif -되다 : progressif OK (배송되고 있어요)", form("배송되다", "verb", "go-iteoyo") === "배송되고 있어요");
check("perception : pas de promesse (보일게요)", form("보이다", "verb", "lgeyo") === null);
check("accident : possibilité OK (다칠 수 있어요)", form("다치다", "verb", "su-itda") === "다칠 수 있어요");
check("verbe d'action : désir OK (먹고 싶어요)", form("먹다", "verb", "go-sipeoyo") === "먹고 싶어요");
check("만지다 reste volontaire", form("만지다", "verb", "seyo") === "만지세요");
check("sujet exprimé : progressif OK (살이 찌고 있어요)", form("살이 찌다", "verb", "go-iteoyo") === "살이 찌고 있어요");
check("accident : pas de progressif (다치고 있어요)", form("다치다", "verb", "go-iteoyo") === null);
check("état : pas de progressif (오래되고 있어요)", form("오래되다", "verb", "go-iteoyo") === null);
check("guérir : pas d'interdiction (낫지 마세요)", form("낫다", "verb", "ji-maseyo") === null);
check("sujet plus loin : pas d'impératif (소화가 안 되세요)", form("소화가 안 되다", "verb", "seyo") === null);
check("adverbe en -이 ≠ sujet (같이 가세요)", form("같이 가다", "verb", "seyo") === "같이 가세요");

// Homonymes levés par le contexte
check("(길을) 묻다 → 물어요", conjugate(analyzeVerb("(길을) 묻다"), E.present) === "물어요");
check("(얼룩이) 묻다 → 묻어요", conjugate(analyzeVerb("(얼룩이) 묻다"), E.present) === "묻어요");
check("(고기를) 굽다 → 구워요", conjugate(analyzeVerb("(고기를) 굽다"), E.present) === "구워요");
check("묻다 sans contexte : refusé", analyzeVerb("묻다") === null);
check("(얼룩이) 묻다 : sujet dans le contexte → pas d'impératif", form("(얼룩이) 묻다", "verb", "seyo") === null);
check("(길을) 묻다 : impératif OK (물으세요)", form("(길을) 묻다", "verb", "seyo") === "물으세요");
check("안부를 묻다 → 안부를 물어요 (contexte sans parenthèses)", conjugate(analyzeVerb("안부를 묻다"), E.present) === "안부를 물어요");

// Variantes acceptées
const doe = acceptedForms(analyzeVerb("되다"), E.present);
check("되다 : 돼요 et 되어요 acceptés", doe.join("/") === "돼요/되어요", doe.join("/"));
check("되다 passé : 됐어요 / 되었어요", acceptedForms(analyzeVerb("되다"), E.past).join("/") === "됐어요/되었어요");
check("먹다 : une seule forme", acceptedForms(analyzeVerb("먹다"), E.present).length === 1);

// Particules
const subj = { cons: "이", vowel: "가" };
const ro = { cons: "으로", vowel: "로", lAsVowel: true };
check("학생이", attachParticle("학생", subj) === "학생이");
check("친구가", attachParticle("친구", subj) === "친구가");
check("버스로", attachParticle("버스", ro) === "버스로");
check("지하철로", attachParticle("지하철", ro) === "지하철로");
check("손으로", attachParticle("손", ro) === "손으로");

console.log(
  failures === 0
    ? "\n✅ Toutes les vérifications passent."
    : `\n❌ ${failures} vérification(s) en échec.`,
);
process.exit(failures === 0 ? 0 : 1);
