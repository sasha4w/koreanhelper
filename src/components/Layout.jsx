import Nav from "./Nav";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">🇰🇷 Korean Helper</span>
      </header>

      <main className="page">{children}</main>

      <Nav />
    </div>
  );
}
