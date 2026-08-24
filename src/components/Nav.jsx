import { NavLink, useLocation } from "react-router-dom";
import "./Nav.css";

const TABS = [
  { to: "/", icon: "🏠", label: "Accueil", match: (p) => p === "/" },
  {
    to: "/vocabulaire",
    icon: "📖",
    label: "Vocabulaire",
    match: (p) => p.startsWith("/vocabulaire"),
  },
  {
    to: "/cours",
    icon: "🧩",
    label: "Cours",
    match: (p) =>
      p.startsWith("/cours") ||
      p.startsWith("/grammaire") ||
      p.startsWith("/verbes"),
  },
  {
    to: "/entrainement",
    icon: "🎯",
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
        const active = tab.match(pathname);
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={active ? "nav-tab active" : "nav-tab"}
            aria-current={active ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="nav-label">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
