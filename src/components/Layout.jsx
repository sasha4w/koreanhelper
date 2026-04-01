import Nav from "./Nav";

export default function Layout({ children }) {
  return (
    <>
      <h1>🇰🇷 Grammaire Coréenne</h1>
      <p className="subtitle">
        Fiche de révision • Terminaisons verbales & Particules
      </p>

      <Nav />

      {children}

      <p className="footer">
        📚 Fiche de révision — Grammaire coréenne &nbsp;|&nbsp; 화이팅! 💜
      </p>
    </>
  );
}
