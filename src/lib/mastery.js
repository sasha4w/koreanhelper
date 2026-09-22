import { getState } from "./progress";

/**
 * Niveau de maîtrise d'un mot, dérivé de sa boîte dans le système de
 * répétition espacée (1 à 5, voir progress.js) — aucune donnée
 * supplémentaire à stocker.
 */
export const MASTERY_TIERS = ["new", "learning", "almost", "mastered"];

/**
 * @param {number|string} wordId
 * @param {object} [state] - état déjà lu via getState(), pour éviter de
 *   relire localStorage à chaque mot quand on calcule une liste entière
 * @returns {"new" | "learning" | "almost" | "mastered"}
 */
export function getWordMasteryTier(wordId, state = getState()) {
  const entry = state.items[`vocab:${wordId}`];
  if (!entry) return "new";
  if (entry.box <= 2) return "learning";
  if (entry.box <= 4) return "almost";
  return "mastered";
}

/**
 * Répartition d'un ensemble de mots par niveau de maîtrise.
 * @param {{id: number}[]} words
 * @returns {{ new: number, learning: number, almost: number, mastered: number }}
 */
export function getMasteryDistribution(words) {
  const state = getState();
  const counts = { new: 0, learning: 0, almost: 0, mastered: 0 };
  for (const w of words) {
    counts[getWordMasteryTier(w.id, state)]++;
  }
  return counts;
}
