/**
 * Vérification hors navigateur de la composition/décomposition hangul.
 * Usage : node scripts/smoke-hangul.mjs
 */
import { typeJamo, backspaceJamo } from "../src/lib/hangul.js";

let failures = 0;
const check = (label, ok, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "OK  " : "FAIL"}  ${label}${extra ? ` — ${extra}` : ""}`);
};

/** Tape une suite de jamo depuis une chaîne vide. */
function typeAll(keys) {
  return keys.reduce((text, key) => typeJamo(text, key), "");
}

/* ── 1. Composition simple ── */
check("ㄱ+ㅏ = 가", typeAll(["ㄱ", "ㅏ"]) === "가");
check("ㄱ+ㅏ+ㄴ = 간", typeAll(["ㄱ", "ㅏ", "ㄴ"]) === "간");

/* ── 2. Bascule de la finale simple vers la syllabe suivante ── */
check(
  "ㄱ,ㅏ,ㄴ,ㅣ = 가니 (bascule)",
  typeAll(["ㄱ", "ㅏ", "ㄴ", "ㅣ"]) === "가니",
);

/* ── 3. Bascule d'une finale composée : la 1ère composante reste ── */
// 닭 = ㄷ+ㅏ+ㄺ (ㄹ+ㄱ). +ㅣ doit donner "달기" (ㄹ reste, ㄱ bascule).
check(
  "닭+ㅣ = 달기 (finale composée, ㄹ reste / ㄱ bascule)",
  typeJamo("닭", "ㅣ") === "달기",
);

/* ── 4. Voyelle composée ── */
check("ㅁ,ㅗ,ㅏ = 뫄 (voyelle composée)", typeAll(["ㅁ", "ㅗ", "ㅏ"]) === "뫄");

/* ── 5. Consonne double directe (touche dédiée, pas de composition) ── */
check(
  "ㅇ,ㅣ,ㅆ,ㄷ,ㅏ = 있다",
  typeAll(["ㅇ", "ㅣ", "ㅆ", "ㄷ", "ㅏ"]) === "있다",
);

/* ── 6. Finale composée directe (ㄱ+ㅅ → ㄳ) ── */
check(
  "ㄱ,ㅏ,ㄱ,ㅅ = 갃 (finale ㄱ étendue en finale composée ㄳ)",
  typeAll(["ㄱ", "ㅏ", "ㄱ", "ㅅ"]) === "갃",
);

/* ── 7. Retour arrière : chaîne complète de décomposition ── */
check("backspace 간 → 가", backspaceJamo("간") === "가");
check("backspace 가 → ㄱ", backspaceJamo("가") === "ㄱ");
check("backspace ㄱ → \"\"", backspaceJamo("ㄱ") === "");
check("backspace \"\" → \"\" (pas d'erreur)", backspaceJamo("") === "");

/* ── 8. Retour arrière sur voyelle composée ── */
check("backspace 뫄 → 모", backspaceJamo("뫄") === "모");

/* ── 9. Retour arrière sur finale composée ── */
// 닭 (ㄷ+ㅏ+ㄺ) → 달 (ㄷ+ㅏ+ㄹ, la finale composée se réduit à sa 1ère composante)
check("backspace 닭 → 달", backspaceJamo("닭") === "달");

/* ── 10. Caractère non coréen : bloc neuf sans composition ── */
check("espace + ㄱ = \" ㄱ\"", typeJamo(" ", "ㄱ") === " ㄱ");
check("a + ㄱ = \"aㄱ\"", typeJamo("a", "ㄱ") === "aㄱ");

console.log(
  failures === 0
    ? "\n✅ Toutes les vérifications passent."
    : `\n❌ ${failures} vérification(s) en échec.`,
);
process.exit(failures === 0 ? 0 : 1);
