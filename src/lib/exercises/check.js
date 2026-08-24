import { isCorrect, normalizeKo, primaryAnswer } from "../normalize";

/** Types dont la réponse est un choix unique parmi des propositions. */
export const CHOICE_KINDS = new Set([
  "ko-to-fr",
  "odd-one-out",
  "grammar-qcm",
  "db-qcm",
]);

/** Types dont la réponse est saisie dans des trous. */
export const BLANK_KINDS = new Set(["blank-from-example", "db-blanks"]);

/** Valeur initiale de la réponse, selon le type d'exercice. */
export function emptyAnswer(exo) {
  if (!exo) return null;
  if (exo.kind === "matching") return {};
  if (exo.kind === "sentence-order") return [];
  if (BLANK_KINDS.has(exo.kind)) return {};
  return "";
}

const blanksOf = (exo) =>
  (exo.segments || []).filter((s) => s.type === "blank");

/** L'utilisateur a-t-il fourni de quoi valider ? */
export function isAnswerReady(exo, value) {
  if (!exo) return false;

  if (exo.kind === "matching") {
    return Object.keys(value || {}).length === (exo.pairs?.length || 0);
  }
  if (exo.kind === "sentence-order") {
    return (value || []).length === (exo.tokens?.length || 0);
  }
  if (BLANK_KINDS.has(exo.kind)) {
    return blanksOf(exo).every((b) => (value?.[b.index] || "").trim());
  }
  return Boolean(String(value || "").trim());
}

/**
 * Corrige une réponse.
 * @returns {{ ok: boolean, detail: object }} detail sert à l'affichage du feedback
 */
export function checkAnswer(exo, value) {
  if (!exo) return { ok: false, detail: {} };

  switch (exo.kind) {
    case "matching": {
      const results = {};
      let ok = true;
      for (const pair of exo.pairs) {
        const given = value?.[pair.id];
        const good = given === pair.fr;
        results[pair.id] = good;
        if (!good) ok = false;
      }
      return { ok, detail: { results } };
    }

    case "sentence-order": {
      const given = (value || []).join(" ");
      const ok = normalizeKo(given) === normalizeKo(exo.expected);
      return { ok, detail: { given } };
    }

    default: {
      if (BLANK_KINDS.has(exo.kind)) {
        const results = {};
        let ok = true;
        for (const blank of blanksOf(exo)) {
          const given = value?.[blank.index] || "";
          const good = isCorrect(given, blank.answer, { lang: exo.lang });
          results[blank.index] = good;
          if (!good) ok = false;
        }
        return { ok, detail: { results } };
      }

      if (CHOICE_KINDS.has(exo.kind)) {
        // Un choix se compare tel quel : c'est une sélection, pas une saisie.
        const ok = String(value) === String(exo.expected);
        return { ok, detail: { given: value } };
      }

      const ok = isCorrect(value, exo.expected, { lang: exo.lang });
      return { ok, detail: { given: value } };
    }
  }
}

/** Réponse à afficher après correction. */
export function displayAnswer(exo) {
  if (!exo) return "";
  if (exo.kind === "sentence-order") return exo.expected;
  if (BLANK_KINDS.has(exo.kind)) {
    return blanksOf(exo)
      .map((b) => b.answer)
      .join(" · ");
  }
  return exo.lang === "fr" ? primaryAnswer(exo.expected) : exo.expected;
}
