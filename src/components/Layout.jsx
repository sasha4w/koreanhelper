import { useLocation } from "react-router-dom";
import Nav from "./Nav";
import { Mark } from "./Icon";
import "./Layout.css";

export default function Layout({ children }) {
  const { pathname } = useLocation();

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
      <main className="page page-transition" key={pathname}>
        {children}
      </main>

      <Nav />
    </div>
  );
}
