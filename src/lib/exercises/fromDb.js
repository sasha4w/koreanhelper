/**
 * Adapte une ligne de la table `exercices` (écrite à la main) vers la forme
 * normalisée du moteur, pour qu'elle se mélange aux exercices générés.
 */

/**
 * Découpe un texte à trous.
 * Format en base : "Je ___[suis allé]___ au marché hier."
 */
export function parseSegments(text) {
  const regex = /___\[([^\]]+)\]___/g;
  const segments = [];
  let last = 0;
  let match;
  let blankIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: "text", value: text.slice(last, match.index) });
    }
    segments.push({ type: "blank", answer: match[1], index: blankIndex++ });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ type: "text", value: text.slice(last) });
  }
  return segments;
}

function parseChoices(choices) {
  if (!choices) return [];
  if (Array.isArray(choices)) return choices;
  try {
    const parsed = JSON.parse(choices);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @returns {object|null} exercice normalisé, ou null si la ligne est inexploitable */
export function fromDbRow(row) {
  if (!row) return null;

  const common = {
    level: String(row.level),
    prompt: row.title || "Exercice",
    hint: row.hint || undefined,
    explanation: row.explanation || undefined,
    grammarPoint: row.grammar_point || undefined,
    tag: row.tag || undefined,
    sourceKey: `exercice:${row.id}`,
    fromDb: true,
  };

  if (row.type === "qcm") {
    const choices = parseChoices(row.choices);
    if (!choices.length || !row.correct_answer) return null;
    return {
      ...common,
      id: `db-qcm:${row.id}`,
      kind: "db-qcm",
      question: row.text || "",
      choices,
      expected: row.correct_answer,
      lang: "fr",
    };
  }

  if (!row.text) return null;
  const segments = parseSegments(row.text);
  const blanks = segments.filter((s) => s.type === "blank");
  if (!blanks.length) return null;

  return {
    ...common,
    id: `db-blanks:${row.id}`,
    kind: "db-blanks",
    segments,
    expected: blanks.map((b) => b.answer),
    lang: "auto",
  };
}

export function fromDbRows(rows) {
  return (rows || []).map(fromDbRow).filter(Boolean);
}
