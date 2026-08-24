/**
 * Comparaison des réponses.
 * — français : tolérant (casse, accents, ponctuation, article initial, alternatives)
 * — coréen   : strict, seuls les espaces sont normalisés
 */

// Jamo (1100-11FF), jamo compat (3130-318F), syllabes (AC00-D7A3)
const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/;
// Diacritiques combinants, retirés après NFD
const COMBINING = /[̀-ͯ]/g;

const LEADING_ARTICLES =
  /^(le |la |les |l'|un |une |des |du |de la |de l'|d'|a |au |aux )/;

/** Détecte la présence de hangul. */
export function isKorean(text) {
  return HANGUL.test(String(text || ""));
}

function squashSpaces(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalisation coréenne : espaces uniquement (l'orthographe compte). */
export function normalizeKo(text) {
  return squashSpaces(text).normalize("NFC");
}

/** Normalisation française : casse, accents, ponctuation, article initial. */
export function normalizeFr(text) {
  let out = squashSpaces(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING, "")
    .replace(/[.,;:!?"'`‘’“”()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Article initial optionnel : "la maison" ≡ "maison"
  const stripped = out.replace(LEADING_ARTICLES, "").trim();
  if (stripped) out = stripped;

  return out;
}

/**
 * Éclate une réponse attendue en variantes acceptées.
 * "manger / bouffer", "aller, se rendre", "poser (une question)".
 */
export function acceptedVariants(expected) {
  const raw = String(expected ?? "");
  const parts = raw
    .split(/\s*[/;,]\s*|\s+ou\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);

  const variants = new Set(parts.length ? parts : [raw.trim()]);

  for (const part of [...variants]) {
    const withoutParens = part.replace(/\([^)]*\)/g, " ").trim();
    if (withoutParens) variants.add(withoutParens);
    const flattened = part.replace(/[()]/g, " ").trim();
    if (flattened) variants.add(flattened);
  }

  return [...variants].filter(Boolean);
}

/**
 * @param {string} given réponse de l'utilisateur
 * @param {string} expected réponse attendue (peut contenir des alternatives)
 * @param {{ lang?: "ko"|"fr"|"auto" }} options
 * @returns {boolean}
 */
export function isCorrect(given, expected, { lang = "auto" } = {}) {
  if (given == null || expected == null) return false;

  const mode = lang === "auto" ? (isKorean(expected) ? "ko" : "fr") : lang;
  const normalize = mode === "ko" ? normalizeKo : normalizeFr;

  const answer = normalize(given);
  if (!answer) return false;

  // Le coréen ne se découpe pas sur la virgule : seul "/" sépare des variantes.
  const variants =
    mode === "ko"
      ? String(expected)
          .split("/")
          .map((v) => v.trim())
          .filter(Boolean)
      : acceptedVariants(expected);

  return variants.some((v) => normalize(v) === answer);
}

/** Première variante lisible d'une réponse attendue (pour l'affichage). */
export function primaryAnswer(expected) {
  const variants = acceptedVariants(expected);
  return variants[0] || String(expected ?? "");
}
