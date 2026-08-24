/**
 * Set d'icônes SVG traits fins, dans le style de la maquette (pas de lib
 * externe). Toutes héritent de `currentColor` et sont dimensionnées en `em`
 * pour suivre le texte environnant.
 */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

function Svg({ children, className, size, style }) {
  return (
    <svg
      {...base}
      className={`icon ${className || ""}`}
      style={{ width: "1em", height: "1em", ...(size ? { fontSize: size } : {}), ...style }}
    >
      {children}
    </svg>
  );
}

export const Home = (p) => (
  <Svg {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4h4v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
  </Svg>
);

export const Book = (p) => (
  <Svg {...p}>
    <path d="M4 5.5A2 2 0 0 1 6 4h6v16H6a2 2 0 0 0-2 1.5V5.5Z" />
    <path d="M20 5.5A2 2 0 0 0 18 4h-6v16h6a2 2 0 0 1 2 1.5V5.5Z" />
  </Svg>
);

export const Puzzle = (p) => (
  <Svg {...p}>
    <path d="M9 4h3.2a1.4 1.4 0 0 1 1.4 1.6 1.4 1.4 0 0 0 1.4 1.6H17a2 2 0 0 1 2 2v2.2a1.4 1.4 0 0 1-1.6 1.4 1.4 1.4 0 0 0-1.4 1.4V16a2 2 0 0 1-2 2h-2.2a1.4 1.4 0 0 1-1.4-1.6 1.4 1.4 0 0 0-1.4-1.4H7a2 2 0 0 1-2-2v-2.4a1.4 1.4 0 0 1 1.6-1.4A1.4 1.4 0 0 0 8 7.6V6a2 2 0 0 1 1-1Z" />
  </Svg>
);

export const Target = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
  </Svg>
);

export const Brain = (p) => (
  <Svg {...p}>
    <path d="M9 4.5A2.5 2.5 0 0 0 6.5 7v1a2.5 2.5 0 0 0-1 4.7A2.5 2.5 0 0 0 7 17h.2a2.3 2.3 0 0 0 4.3-1V6.5A2 2 0 0 0 9 4.5Z" />
    <path d="M15 4.5A2.5 2.5 0 0 1 17.5 7v1a2.5 2.5 0 0 1 1 4.7A2.5 2.5 0 0 1 17 17h-.2a2.3 2.3 0 0 1-4.3-1V6.5a2 2 0 0 1 2.5-2Z" />
  </Svg>
);

export const Pencil = (p) => (
  <Svg {...p}>
    <path d="m14.5 5 4.5 4.5L8 20.5H3.5V16Z" />
    <path d="m12.5 7 4.5 4.5" />
  </Svg>
);

export const Flame = (p) => (
  <Svg {...p}>
    <path d="M12 3s4 3.6 4 8a4 4 0 0 1-8 0c0-1 .4-1.8 1-2.5-.2 1 0 1.8.8 2.2C9.4 9 9 6.8 10.8 4.6c.4 1 1.2 1.4 2 1 -.6-1-1-1.8-.8-2.6Z" />
    <path d="M9 15a3 3 0 0 0 6 0" />
  </Svg>
);

export const Clock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const Star = (p) => (
  <Svg {...p}>
    <path d="m12 3.5 2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.8Z" />
  </Svg>
);

export const CheckCircle = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.2 12.3 2.4 2.4 5.2-5.2" />
  </Svg>
);

export const Search = (p) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.6-4.6" />
  </Svg>
);

export const X = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const Chevron = (p) => (
  <Svg {...p}>
    <path d="m7 10 5 5 5-5" />
  </Svg>
);

export const ChevronRight = (p) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const Pin = (p) => (
  <Svg {...p}>
    <path d="M12 3c2.5 0 4.5 2 4.5 4.5 0 2.9-3 6.6-4.1 7.8a.6.6 0 0 1-.8 0C10.5 14.1 7.5 10.4 7.5 7.5 7.5 5 9.5 3 12 3Z" />
    <path d="M12 21v-5.5" />
    <circle cx="12" cy="7.5" r="1.6" fill="currentColor" stroke="none" />
  </Svg>
);

export const Bulb = (p) => (
  <Svg {...p}>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2.2h5.2c0-1 .4-1.7 1-2.2A6 6 0 0 0 12 3Z" />
  </Svg>
);

export const BookOpen = (p) => (
  <Svg {...p}>
    <path d="M12 6.5C10.5 5 8 4 4 4v14c4 0 6.5 1 8 2.5" />
    <path d="M12 6.5C13.5 5 16 4 20 4v14c-4 0-6.5 1-8 2.5" />
  </Svg>
);

export const Keyboard = (p) => (
  <Svg {...p}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M6.5 14h9" />
  </Svg>
);

export const Shuffle = (p) => (
  <Svg {...p}>
    <path d="M4 6h3.5L14 16h6" />
    <path d="M4 16h3.5L10 12" />
    <path d="m17 4 3 2-3 2M17 18l3-2-3-2" />
  </Svg>
);

export const Link = (p) => (
  <Svg {...p}>
    <path d="M10 14a4 4 0 0 0 5.7.3L18 12a4 4 0 1 0-5.6-5.6l-1.3 1.2" />
    <path d="M14 10a4 4 0 0 0-5.7-.3L6 12a4 4 0 1 0 5.6 5.6l1.2-1.2" />
  </Svg>
);

export const Eye = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.6" />
  </Svg>
);

export const ListChecks = (p) => (
  <Svg {...p}>
    <path d="m4 7 1.5 1.5L8 6" />
    <path d="m4 13 1.5 1.5L8 12" />
    <path d="M11 7h9M11 13h9M11 19h9" />
  </Svg>
);

export const Trophy = (p) => (
  <Svg {...p}>
    <path d="M7 4h10v4a5 5 0 0 1-10 0Z" />
    <path d="M7 5H4.5A1.5 1.5 0 0 0 3 6.5 3.5 3.5 0 0 0 6.5 10H7M17 5h2.5A1.5 1.5 0 0 1 21 6.5 3.5 3.5 0 0 1 17.5 10H17" />
    <path d="M12 13v3.5M9 20.5h6M9.5 20.5c0-2 .8-2.7 2.5-3 1.7.3 2.5 1 2.5 3" />
  </Svg>
);

export const ThumbsUp = (p) => (
  <Svg {...p}>
    <path d="M7 11v9H4.5A1.5 1.5 0 0 1 3 18.5v-6A1.5 1.5 0 0 1 4.5 11H7Z" />
    <path d="M7 11l3.5-6.5a1.8 1.8 0 0 1 3.3 1.2L13 9h4.3A2 2 0 0 1 19.2 12l-1.6 6.4a2 2 0 0 1-1.9 1.6H9.5A2.5 2.5 0 0 1 7 17.5" />
  </Svg>
);

export const Zap = (p) => (
  <Svg {...p}>
    <path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5Z" />
  </Svg>
);

export const RotateCcw = (p) => (
  <Svg {...p}>
    <path d="M4.6 9A8 8 0 1 1 4 13" />
    <path d="M4 4.5V9h4.5" />
  </Svg>
);

export const Play = (p) => (
  <Svg {...p}>
    <path d="M8 5.5v13l11-6.5Z" />
  </Svg>
);

export const Wave = (p) => (
  <Svg {...p}>
    <path d="M8 12.5V6a1.5 1.5 0 0 1 3 0v5" />
    <path d="M11 11V4.5a1.5 1.5 0 0 1 3 0V11" />
    <path d="M14 11.3V6a1.5 1.5 0 0 1 3 0v8" />
    <path d="M17 12v2.5c0 3.6-2.4 6.5-6 6.5-2.5 0-4-.9-5.4-2.8L3 13.8c-.6-.9-.2-2 .7-2.3.7-.2 1.4 0 1.9.6L8 15" />
  </Svg>
);

/** Petit sceau « KR » stylisé — remplace le drapeau emoji dans l'en-tête. */
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
