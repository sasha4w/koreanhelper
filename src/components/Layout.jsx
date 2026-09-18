import { useLocation } from "react-router-dom";
import Nav from "./Nav";
import { Mark } from "./Icon";
import "./Layout.css";

// Pages dont le contenu profite d'une grille plus large (Vocabulaire,
// Grammaire/Verbes) : la nouvelle grille de cartes gaspille moins l'espace
// que l'ancienne pile d'accordéons, donc elle mérite plus de largeur.
const WIDE_ROUTES = ["/vocabulaire", "/cours"];

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const isWide = WIDE_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">
          <Mark />
          Korean Helper
        </span>
      </header>

      {/* La `key` remonte ce wrapper à chaque changement de route : son
          animation d'entrée en CSS se rejoue automatiquement, sans JS. */}
      <main
        className={`page page-transition${isWide ? " wide" : ""}`}
        key={pathname}
      >
        {children}
      </main>

      <Nav />
    </div>
  );
}
