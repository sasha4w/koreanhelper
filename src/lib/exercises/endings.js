/**
 * Relie les leçons (tables `verbes` et `grammaire`) aux règles du moteur de
 * conjugaison / particules. Le champ `formula` étant du texte libre, la
 * correspondance se fait sur le titre normalisé (espaces, tirets retirés).
 *
 * Une leçon absente de ce catalogue ne produit simplement pas d'exercice
 * combiné : ajouter une ligne ici suffit pour l'activer.
 */

/** "-(으)ㄹ 거예요" → "(으)ㄹ거예요" */
export const normTitle = (title) =>
  String(title || "")
    .replace(/[\s\-–—~]/g, "")
    .replace(/^V(?=[가-힣(])/, "");

/**
 * pos : "verb" (verbes d'action seulement), "both", ou des terminaisons
 * différentes selon la nature ({ verb, adj }).
 * agentive : terminaison qui suppose une action volontaire (voir endingFor).
 * label : consigne courte affichée dans l'exercice.
 */
export const VERB_ENDINGS = [
  { id: "present", test: /^(아요\/어요|아\/어요)$/, label: "présent poli -아/어요", pos: "both", ending: { base: "aeo", suffix: "요" } },
  { id: "past", test: /^(았어요\/었어요|았\/었어요)$/, label: "passé poli -았/었어요", pos: "both", ending: { base: "aeo", suffix: "ㅆ어요" } },
  { id: "future", test: /^\(으\)ㄹ거예요$/, label: "futur -(으)ㄹ 거예요", pos: "both", ending: { base: "eu", suffix: "ㄹ 거예요" } },
  { id: "go-iteoyo", agentive: true, test: /^고\/고있어요$/, label: "progressif -고 있어요", pos: "verb", ending: { base: "plain", suffix: "고 있어요" } },
  { id: "myeonseo", agentive: true, test: /^\(으\)면서$/, label: "simultanéité -(으)면서", pos: "verb", ending: { base: "eu", suffix: "면서" } },
  { id: "aseo", test: /^아서\/어서$/, label: "cause / succession -아/어서", pos: "both", ending: { base: "aeo", suffix: "서" } },
  { id: "myeon", test: /^\(으\)면$/, label: "condition -(으)면", pos: "both", ending: { base: "eu", suffix: "면" } },
  { id: "geona", test: /^거나$/, label: "alternative -거나", pos: "both", ending: { base: "plain", suffix: "거나" } },
  { id: "reo-gada", agentive: true, test: /^\(으\)러가다\/오다$/, label: "but du déplacement -(으)러 가요", pos: "verb", ending: { base: "eu", suffix: "러 가요" } },
  { id: "su-itda", agentive: true, test: /^\(으\)ㄹ수있다\/없다$/, label: "capacité -(으)ㄹ 수 있어요", pos: "verb", ending: { base: "eu", suffix: "ㄹ 수 있어요" } },
  { id: "jul-alda", agentive: true, test: /^\(으\)ㄹ줄알다\/모르다$/, label: "savoir-faire -(으)ㄹ 줄 알아요", pos: "verb", ending: { base: "eu", suffix: "ㄹ 줄 알아요" } },
  { id: "seyo", agentive: true, test: /^\(으\)세요$/, label: "impératif poli -(으)세요", pos: "verb", ending: { base: "eu", suffix: "세요" } },
  { id: "ji-maseyo", agentive: true, test: /^지마세요$/, label: "interdiction -지 마세요", pos: "verb", ending: { base: "plain", suffix: "지 마세요" } },
  { id: "go-sipeoyo", agentive: true, test: /^고싶어요$/, label: "désir -고 싶어요", pos: "verb", ending: { base: "plain", suffix: "고 싶어요" } },
  { id: "a-boda", agentive: true, test: /^아\/어보다$/, label: "expérience -아/어 봤어요", pos: "verb", ending: { base: "aeo", suffix: " 봤어요" } },
  { id: "aya-doeda", test: /^아야\/어야되다$/, label: "obligation -아/어야 돼요", pos: "both", ending: { base: "aeo", suffix: "야 돼요" } },
  { id: "a-juseyo", agentive: true, test: /^아\/어주세요$/, label: "demande polie -아/어 주세요", pos: "verb", ending: { base: "aeo", suffix: " 주세요" } },
  { id: "a-deurilgeyo", agentive: true, test: /^아\/어드릴게요$/, label: "offre -아/어 드릴게요", pos: "verb", ending: { base: "aeo", suffix: " 드릴게요" } },
  { id: "a-deurilkkayo", agentive: true, test: /^아\/어드릴까요\?$/, label: "proposition -아/어 드릴까요 ?", pos: "verb", ending: { base: "aeo", suffix: " 드릴까요" } },
  { id: "a-boida", test: /^아\/어보이다$/, label: "apparence -아/어 보여요", pos: "adj", ending: { base: "aeo", suffix: " 보여요" } },
  { id: "eodo-doeda", agentive: true, test: /^아\/어도되다$/, label: "permission -아/어도 돼요", pos: "verb", ending: { base: "aeo", suffix: "도 돼요" } },
  { id: "myeon-an-doeda", agentive: true, test: /^\(으\)면안되다$/, label: "interdiction -(으)면 안 돼요", pos: "verb", ending: { base: "eu", suffix: "면 안 돼요" } },
  { id: "myeon-doeda", test: /^\(으\)면되다$/, label: "suffisance -(으)면 돼요", pos: "verb", ending: { base: "eu", suffix: "면 돼요" } },
  { id: "nikka", test: /^\(으\)니까$/, label: "cause -(으)니까", pos: "both", ending: { base: "eu", suffix: "니까" } },
  { id: "ryeogo", agentive: true, test: /^\(으\)려고$/, label: "intention -(으)려고", pos: "verb", ending: { base: "eu", suffix: "려고" } },
  { id: "ryeogo-hada", agentive: true, test: /^\(으\)려고하다$/, label: "intention -(으)려고 해요", pos: "verb", ending: { base: "eu", suffix: "려고 해요" } },
  { id: "ryeomyeon", agentive: true, test: /^\(으\)려면$/, label: "condition de but -(으)려면", pos: "verb", ending: { base: "eu", suffix: "려면" } },
  { id: "gi-jeone", test: /^기전에$/, label: "antériorité -기 전에", pos: "verb", ending: { base: "plain", suffix: "기 전에" } },
  { id: "eun-daeume", test: /^\(으\)ㄴ다음에$/, label: "postériorité -(으)ㄴ 다음에", pos: "verb", ending: { base: "eu", suffix: "ㄴ 다음에" } },
  { id: "neun-dongan", test: /^는동안$/, label: "pendant -는 동안", pos: "verb", ending: { base: "plain", suffix: "는 동안" } },
  { id: "daga", test: /^다가$/, label: "interruption -다가", pos: "verb", ending: { base: "plain", suffix: "다가" } },
  { id: "gesseoyo", test: /^겠어요$/, label: "supposition / volonté -겠어요", pos: "both", ending: { base: "plain", suffix: "겠어요" } },
  { id: "lgeyo", agentive: true, test: /^\(으\)ㄹ게요$/, label: "promesse -(으)ㄹ게요", pos: "verb", ending: { base: "eu", suffix: "ㄹ게요" } },
  { id: "myeon-jokets", test: /^\(으\)면좋겠다$/, label: "souhait -(으)면 좋겠어요", pos: "both", ending: { base: "eu", suffix: "면 좋겠어요" } },
  { id: "gi-ro-haesseoyo", agentive: true, test: /^기로했어요$/, label: "décision -기로 했어요", pos: "verb", ending: { base: "plain", suffix: "기로 했어요" } },
  { id: "gi-eoryeopda", test: /^기\(가\)쉽다\/어렵다$/, label: "facilité -기 어려워요", pos: "verb", ending: { base: "plain", suffix: "기 어려워요" } },
  { id: "ltte", test: /^\(으\)ㄹ때$/, label: "moment -(으)ㄹ 때", pos: "both", ending: { base: "eu", suffix: "ㄹ 때" } },
  { id: "asseul-ttae", test: /^았\/었을때$/, label: "moment passé -았/었을 때", pos: "both", ending: { base: "aeo", suffix: "ㅆ을 때" } },
  { id: "eun-jeok", agentive: true, test: /^\(으\)ㄴ적이있다\/없다$/, label: "expérience -(으)ㄴ 적이 있어요", pos: "verb", ending: { base: "eu", suffix: "ㄴ 적이 있어요" } },
  { id: "l-ppeonhada", test: /^\(으\)ㄹ뻔하다$/, label: "« avoir failli » -(으)ㄹ 뻔했어요", pos: "verb", ending: { base: "eu", suffix: "ㄹ 뻔했어요" } },
  { id: "nde", test: /^\(으\)ㄴ데\/는데$/, label: "contraste / contexte -(으)ㄴ데 / -는데", pos: { verb: { base: "plain", suffix: "는데" }, adj: { base: "eu", suffix: "ㄴ데" } } },
  { id: "pyeon", test: /^\(으\)ㄴ\/는편이다$/, label: "tendance -(으)ㄴ/는 편이에요", pos: { verb: { base: "plain", suffix: "는 편이에요" }, adj: { base: "eu", suffix: "ㄴ 편이에요" } } },
  { id: "geot-gatda-1", test: /^것같다①/, label: "supposition présente -는/(으)ㄴ 것 같아요", pos: { verb: { base: "plain", suffix: "는 것 같아요" }, adj: { base: "eu", suffix: "ㄴ 것 같아요" } } },
  { id: "geot-gatda-3", test: /^것같다③/, label: "supposition future -(으)ㄹ 것 같아요", pos: "both", ending: { base: "eu", suffix: "ㄹ 것 같아요" } },
  { id: "neun-ge-eottaeyo", agentive: true, test: /^는게어때요\?$/, label: "suggestion -는 게 어때요 ?", pos: "verb", ending: { base: "plain", suffix: "는 게 어때요" } },
  { id: "ji-anayo", test: /^지않아요\?$/, label: "confirmation -지 않아요 ?", pos: "both", ending: { base: "plain", suffix: "지 않아요" } },
  { id: "jiyo", test: /^지요\?\(죠\?\)$/, label: "confirmation -지요 ?", pos: "both", ending: { base: "plain", suffix: "지요" } },
  { id: "neyo", test: /^네요$/, label: "exclamation -네요", pos: "both", ending: { base: "plain", suffix: "네요" } },
  { id: "seumnida", test: /^습니다\/ㅂ니다$/, label: "formel -습니다 / -ㅂ니다", pos: "both", ending: { base: "seumnida" } },
  { id: "bsida", agentive: true, test: /^ㅂ시다\/읍시다$/, label: "proposition formelle -(으)ㅂ시다", pos: "verb", ending: { base: "eu", suffix: "ㅂ시다" } },
  { id: "eojida", test: /^아지다\/어지다$|^아\/어지다$/, label: "changement d'état -아/어져요", pos: "adj", ending: { base: "aeo", suffix: "져요" } },
];

/** Terminaison applicable à un verbe de nature `pos`, ou null. */
export function endingFor(spec, pos, verb) {
  if (!spec) return null;
  // Terminaisons volontaires (impératif, désir, promesse…) : pas avec un
  // sujet non humain exprimé (« 살이 찌세요 » n'a pas de sens).
  if (spec.agentive && verb?.hasSubject) return null;
  if (typeof spec.pos === "object") return spec.pos[pos] || null;
  if (spec.pos === "both" || spec.pos === pos) return spec.ending;
  return null;
}

/** Règle de terminaison associée à une leçon, ou null. */
export function verbEndingForLesson(lesson) {
  if (!lesson || lesson.__table !== "verbes") return null;
  const t = normTitle(lesson.title);
  return VERB_ENDINGS.find((s) => s.test.test(t)) || null;
}

/* ───────────────── Particules ───────────────── */

export const PARTICLES = [
  { id: "i-ga", test: /^이\/가$/, label: "particule de sujet", rule: { cons: "이", vowel: "가" } },
  { id: "eul-reul", test: /^을\/를$/, label: "particule d'objet", rule: { cons: "을", vowel: "를" } },
  { id: "eun-neun", test: /^은\/는$/, label: "particule de thème", rule: { cons: "은", vowel: "는" } },
  { id: "gwa-wa", test: /^과\/와$/, label: "« et / avec » (écrit)", rule: { cons: "과", vowel: "와" } },
  { id: "euro", test: /^\(으\)로$/, label: "moyen / direction", rule: { cons: "으로", vowel: "로", lAsVowel: true } },
  { id: "ina", test: /^\(이\)나$/, label: "« ou »", rule: { cons: "이나", vowel: "나" } },
];

export function particleForLesson(lesson) {
  if (!lesson || lesson.__table !== "grammaire") return null;
  const t = normTitle(lesson.title);
  return PARTICLES.find((p) => p.test.test(t)) || null;
}

/** Nature grammaticale d'un mot de vocabulaire, au sens du moteur. */
export function verbPos(word) {
  if (word?.type === "동사") return "verb";
  if (word?.type === "형용사") return "adj";
  return null;
}
