import {
  Keyboard,
  Search,
  Link as LinkIcon,
  Eye,
  Puzzle,
  Pencil,
  Shuffle,
  ListChecks,
} from "../components/Icon";

/** Couleurs des catégories grammaticales coréennes (parties du discours). */
export const TYPE_COLORS = {
  명사: { bg: "#EEEDFE", color: "#3C3489" },
  동사: { bg: "#E1F5EE", color: "#085041" },
  형용사: { bg: "#FAECE7", color: "#993C1D" },
  부사: { bg: "#FAEEDA", color: "#854F0B" },
  expression: { bg: "#FDE8F5", color: "#7B1F6A" },
  의존명사: { bg: "#E8F0FD", color: "#1A3A8A" },
  관형사: { bg: "#FDF3E8", color: "#8A4A1A" },
  대명사: { bg: "#E8FDF3", color: "#1A6A4A" },
  접속사: { bg: "#F3E8FD", color: "#5A1A8A" },
  조사: { bg: "#FDE8E8", color: "#8A1A1A" },
};

export const TYPE_FALLBACK = { bg: "#F1EFE8", color: "#5F5E5A" };

export function typeStyle(type) {
  return TYPE_COLORS[type] || TYPE_FALLBACK;
}

/** Libellés lisibles des types d'exercices. */
export const KIND_LABELS = {
  "fr-to-ko": "Écrire en coréen",
  "ko-to-fr": "Comprendre le coréen",
  matching: "Associer les paires",
  "odd-one-out": "Trouver l'intrus",
  "grammar-qcm": "Reconnaître la règle",
  "blank-from-example": "Compléter la phrase",
  "sentence-order": "Remettre dans l'ordre",
  "db-blanks": "Exercice à trous",
  "db-qcm": "QCM",
};

/** Composant icône par type d'exercice (utiliser <KIND_ICONS[kind] />). */
export const KIND_ICONS = {
  "fr-to-ko": Keyboard,
  "ko-to-fr": Search,
  matching: LinkIcon,
  "odd-one-out": Eye,
  "grammar-qcm": Puzzle,
  "blank-from-example": Pencil,
  "sentence-order": Shuffle,
  "db-blanks": Pencil,
  "db-qcm": ListChecks,
};

export const DEFAULT_KIND_ICON = Pencil;

/** Types nécessitant un clavier coréen (IME). */
export const KINDS_NEEDING_IME = new Set([
  "fr-to-ko",
  "blank-from-example",
  "db-blanks",
]);
