import { NavLink, useLocation } from "react-router-dom";
import { Home as HomeIcon, Book, Puzzle, Target } from "./Icon";
import "./Nav.css";

const TABS = [
  { to: "/", Icon: HomeIcon, label: "Accueil", match: (p) => p === "/" },
  {
    to: "/vocabulaire",
    Icon: Book,
    label: "Vocabulaire",
    match: (p) => p.startsWith("/vocabulaire"),
  },
  {
    to: "/cours",
    Icon: Puzzle,
    label: "Cours",
    match: (p) =>
      p.startsWith("/cours") ||
      p.startsWith("/grammaire") ||
      p.startsWith("/verbes"),
  },
  {
    to: "/entrainement",
    Icon: Target,
    label: "S'entraîner",
    match: (p) =>
      p.startsWith("/entrainement") ||
      p.startsWith("/quiz") ||
      p.startsWith("/exo"),
  },
];

export default function Nav() {
  const { pathname } = useLocation();

  return (
    <nav className="nav" aria-label="Navigation principale">
      {TABS.map((tab) => {
        // Déstructuré ici plutôt que dans la signature de la callback :
        // un paramètre destructuré utilisé seulement comme balise JSX
        // (<Icon />) échappe à l'analyse d'usage d'ESLint dans ce projet.
        const { to, Icon, label, match } = tab;
        const active = match(pathname);
        return (
          <NavLink
            key={to}
            to={to}
            className={active ? "nav-tab active" : "nav-tab"}
            aria-current={active ? "page" : undefined}
          >
            <span className="nav-icon">
              <Icon />
            </span>
            <span className="nav-label">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
