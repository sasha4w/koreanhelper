/**
 * Icônes Google Material Symbols (style « Rounded »), chargées comme police
 * depuis Google Fonts dans index.html — uniquement les glyphes listés ici
 * (paramètre `icon_names`), pour une police de quelques Ko.
 *
 * Les noms d'export sont inchangés : les pages importent toujours
 * `{ Home, Book, … }`. Chaque icône hérite de `currentColor` et se
 * dimensionne en `em` pour suivre le texte environnant.
 *
 * ⚠ Ajouter une icône = ajouter son nom ici ET dans `icon_names` (ordre
 * alphabétique) dans index.html, sinon le glyphe ne s'affiche pas.
 * Catalogue : https://fonts.google.com/icons?icon.style=Rounded
 */

function MaterialSymbol({ name, className, size, style, filled }) {
  return (
    <span
      className={`icon material-symbols-rounded ${className || ""}`}
      aria-hidden="true"
      translate="no"
      style={{
        ...(size ? { fontSize: size } : {}),
        ...(filled ? { fontVariationSettings: '"FILL" 1' } : {}),
        ...style,
      }}
    >
      {name}
    </span>
  );
}

const icon = (name, defaults = {}) => {
  const Icon = (p) => <MaterialSymbol name={name} {...defaults} {...p} />;
  Icon.displayName = `Icon(${name})`;
  return Icon;
};

export const Home = icon("home");
export const Book = icon("menu_book");
export const Puzzle = icon("extension");
export const Target = icon("adjust");
export const Brain = icon("psychology");
export const Pencil = icon("edit");
export const Flame = icon("local_fire_department");
export const Clock = icon("schedule");
export const Star = icon("star");
export const CheckCircle = icon("check_circle");
export const Search = icon("search");
export const X = icon("close");
export const Chevron = icon("expand_more");
export const ChevronRight = icon("chevron_right");
export const Pin = icon("push_pin");
export const Bulb = icon("lightbulb");
export const BookOpen = icon("auto_stories");
export const Keyboard = icon("keyboard");
export const Shuffle = icon("shuffle");
export const Link = icon("link");
export const Eye = icon("visibility");
export const ListChecks = icon("checklist");
export const Trophy = icon("trophy");
export const ThumbsUp = icon("thumb_up");
export const Zap = icon("bolt");
export const RotateCcw = icon("replay");
export const Play = icon("play_arrow");
export const Speaker = icon("volume_up");
export const Wave = icon("waving_hand");
export const User = icon("person");
export const BarChart = icon("bar_chart");
export const LogOut = icon("logout");
export const Cloud = icon("cloud_done");
export const Calendar = icon("calendar_month");

/** Logo de l'app (pas une icône Material : identité visuelle propre). */
export const Mark = (p) => (
  <svg
    viewBox="0 0 24 24"
    className={`icon icon-mark ${p?.className || ""}`}
    style={{ width: "1.5em", height: "1.5em" }}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="11" fill="var(--violet)" />
    <path
      d="M12 5.5A6.5 6.5 0 0 1 12 18.5 3.25 3.25 0 0 1 12 12 3.25 3.25 0 0 0 12 5.5Z"
      fill="var(--rose)"
    />
    <path d="M12 5.5A6.5 6.5 0 0 0 12 18.5" fill="none" stroke="#fff" strokeWidth="0.6" />
  </svg>
);
