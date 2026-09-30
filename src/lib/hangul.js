/**
 * Composition/décomposition de syllabes hangul (algorithme du bloc Unicode
 * Hangul Syllables, 0xAC00–0xD7A3). Aucune dépendance : implémentation
 * manuelle, dans l'esprit du reste du projet.
 *
 * Représentation : le texte est une simple chaîne (identique à la valeur
 * `value` déjà gérée par InputBody/BlankToken). Un jamo "en attente" (pas
 * encore combiné à une voyelle) est stocké tel quel comme caractère jamo
 * de compatibilité autonome (ex. "ㄱ"), pas comme syllabe.
 */

export const INITIALS = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

export const MEDIALS = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
];

export const FINALS = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
  "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

/** Voyelles "de base" saisissables directement au clavier (touches réelles). */
export const BASE_MEDIALS = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ", "ㅣ",
];

const VOWEL_COMPOUNDS = {
  "ㅗㅏ": "ㅘ", "ㅗㅐ": "ㅙ", "ㅗㅣ": "ㅚ",
  "ㅜㅓ": "ㅝ", "ㅜㅔ": "ㅞ", "ㅜㅣ": "ㅟ",
  "ㅡㅣ": "ㅢ",
};
const VOWEL_DECOMPOSE = {
  ㅘ: ["ㅗ", "ㅏ"], ㅙ: ["ㅗ", "ㅐ"], ㅚ: ["ㅗ", "ㅣ"],
  ㅝ: ["ㅜ", "ㅓ"], ㅞ: ["ㅜ", "ㅔ"], ㅟ: ["ㅜ", "ㅣ"],
  ㅢ: ["ㅡ", "ㅣ"],
};

const FINAL_COMPOUNDS = {
  "ㄱㅅ": "ㄳ", "ㄴㅈ": "ㄵ", "ㄴㅎ": "ㄶ", "ㄹㄱ": "ㄺ", "ㄹㅁ": "ㄻ",
  "ㄹㅂ": "ㄼ", "ㄹㅅ": "ㄽ", "ㄹㅌ": "ㄾ", "ㄹㅍ": "ㄿ", "ㄹㅎ": "ㅀ", "ㅂㅅ": "ㅄ",
};
const FINAL_DECOMPOSE = {
  ㄳ: ["ㄱ", "ㅅ"], ㄵ: ["ㄴ", "ㅈ"], ㄶ: ["ㄴ", "ㅎ"], ㄺ: ["ㄹ", "ㄱ"], ㄻ: ["ㄹ", "ㅁ"],
  ㄼ: ["ㄹ", "ㅂ"], ㄽ: ["ㄹ", "ㅅ"], ㄾ: ["ㄹ", "ㅌ"], ㄿ: ["ㄹ", "ㅍ"], ㅀ: ["ㄹ", "ㅎ"], ㅄ: ["ㅂ", "ㅅ"],
};

const isInitialKey = (ch) => INITIALS.includes(ch);
const isBaseMedialKey = (ch) => BASE_MEDIALS.includes(ch);

function composeSyllable(iCh, mCh, fCh = "") {
  const i = INITIALS.indexOf(iCh);
  const m = MEDIALS.indexOf(mCh);
  const f = FINALS.indexOf(fCh);
  if (i < 0 || m < 0 || f < 0) return null;
  return String.fromCharCode(0xac00 + (i * 21 + m) * 28 + f);
}

function decomposeSyllable(ch) {
  const code = ch.codePointAt(0) - 0xac00;
  if (code < 0 || code > 11171) return null; // pas une syllabe précomposée
  const f = code % 28;
  const m = ((code - f) / 28) % 21;
  const i = Math.floor((code - f) / 28 / 21);
  return { i: INITIALS[i], m: MEDIALS[m], f: FINALS[f] };
}

/**
 * Combine le caractère du texte actuel avec une nouvelle touche jamo
 * (une consonne parmi INITIALS ou une voyelle parmi BASE_MEDIALS).
 * Gère la composition, l'extension de syllabe, les voyelles/finales
 * composées, et la règle classique de "bascule" de la finale vers la
 * syllabe suivante quand une voyelle arrive après une consonne finale.
 */
export function typeJamo(text, key) {
  if (!text) return text + key;

  const last = text.slice(-1);
  const rest = text.slice(0, -1);

  // Cas 1 : dernier caractère = consonne isolée en attente d'une voyelle.
  if (isInitialKey(last)) {
    if (isBaseMedialKey(key)) {
      const syll = composeSyllable(last, key);
      if (syll) return rest + syll;
    }
    return text + key; // deux consonnes de suite : bloc suivant
  }

  // Cas 2 : dernier caractère = voyelle isolée (aucune consonne initiale).
  if (isBaseMedialKey(last) || last in VOWEL_DECOMPOSE) {
    if (isBaseMedialKey(key)) {
      const combo = VOWEL_COMPOUNDS[last + key];
      if (combo) return rest + combo;
    }
    return text + key;
  }

  const d = decomposeSyllable(last);
  if (!d) return text + key; // caractère non coréen (espace, latin…) : bloc neuf

  const { i, m, f } = d;

  if (isBaseMedialKey(key)) {
    if (!f) {
      // Pas de finale : tenter d'étendre la voyelle en voyelle composée.
      const combo = VOWEL_COMPOUNDS[m + key];
      if (combo) {
        const syll = composeSyllable(i, combo, "");
        if (syll) return rest + syll;
      }
      return text + key; // voyelle non combinable : bloc suivant
    }
    // Finale présente : elle "bascule" vers la nouvelle syllabe.
    // Si la finale est composée (ex. ㄺ), seule sa 2e composante bascule ;
    // la 1re reste comme finale simple de la syllabe d'origine.
    const parts = FINAL_DECOMPOSE[f] || [f];
    const keptFinal = parts.length > 1 ? parts[0] : "";
    const movingConsonant = parts[parts.length - 1];
    const reduced = composeSyllable(i, m, keptFinal);
    const created = composeSyllable(movingConsonant, key, "");
    if (reduced && created) return rest + reduced + created;
    return text + key;
  }

  // key est une consonne.
  if (!f) {
    if (FINALS.includes(key)) {
      const syll = composeSyllable(i, m, key);
      if (syll) return rest + syll;
    }
    return text + key; // ㄸ/ㅃ/ㅉ ne sont jamais des finales : bloc suivant
  }
  const combo = FINAL_COMPOUNDS[f + key];
  if (combo) {
    const syll = composeSyllable(i, m, combo);
    if (syll) return rest + syll;
  }
  return text + key; // finale déjà pleine, pas de combinaison possible
}

/**
 * Retire la dernière "unité" de saisie : réduit une finale composée à sa
 * première composante, puis une voyelle composée à sa première composante,
 * puis retombe sur la consonne initiale isolée, puis la supprime.
 * Ex. "간" → "가" → "ㄱ" → "".
 */
export function backspaceJamo(text) {
  if (!text) return text;
  const last = text.slice(-1);
  const rest = text.slice(0, -1);

  if (last in VOWEL_DECOMPOSE) return rest + VOWEL_DECOMPOSE[last][0];

  const d = decomposeSyllable(last);
  if (!d) return rest; // jamo isolé ou caractère non coréen : suppression simple

  const { i, m, f } = d;

  if (f) {
    const parts = FINAL_DECOMPOSE[f];
    const reducedFinal = parts ? parts[0] : "";
    const syll = composeSyllable(i, m, reducedFinal);
    return syll ? rest + syll : rest;
  }
  if (m in VOWEL_DECOMPOSE) {
    const syll = composeSyllable(i, VOWEL_DECOMPOSE[m][0], "");
    return syll ? rest + syll : rest;
  }
  return rest + i; // ne reste que la consonne initiale
}
