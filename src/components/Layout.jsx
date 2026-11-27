import { Link, useLocation } from "react-router-dom";
import Nav from "./Nav";
import { Mark, User } from "./Icon";
import { useAuth } from "../lib/auth/AuthProvider";
import "./Layout.css";

/** Accès au compte, en haut à droite : initiale si connecté. */
function AccountButton() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <Link
      to="/compte"
      className="header-account"
      aria-label={user ? "Mon compte" : "Se connecter"}
    >
      {user ? (
        <span className="dot">{(user.email || "?").slice(0, 1).toUpperCase()}</span>
      ) : (
        <User />
      )}
      <span className="label">{user ? "Compte" : "Se connecter"}</span>
    </Link>
  );
}

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
        <AccountButton />
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
