/**
 * Dérive la liste des niveaux réellement présents dans les données.
 * Ajouter du contenu de niveau 3 en base suffit : aucun code à modifier.
 *
 * @param {...object[]} rowSets une ou plusieurs collections avec un champ `level`
 * @returns {string[]} niveaux triés numériquement, ex. ["1", "2"]
 */
export function deriveLevels(...rowSets) {
  const seen = new Set();
  for (const rows of rowSets) {
    for (const row of rows || []) {
      if (row?.level == null || row.level === "") continue;
      seen.add(String(row.level));
    }
  }
  return [...seen].sort((a, b) => Number(a) - Number(b));
}

/** Options de filtre prêtes à l'emploi, avec l'entrée « Tout voir ». */
export function levelOptions(rows, { withAll = true } = {}) {
  const levels = deriveLevels(rows).map((l) => ({
    value: l,
    label: `Niveau ${l}`,
  }));
  return withAll ? [{ value: "all", label: "Tout voir" }, ...levels] : levels;
}

/** Compare un champ `level` (int ou text côté base) à une valeur de filtre. */
export function matchesLevel(row, level) {
  return level === "all" || String(row?.level) === String(level);
}
