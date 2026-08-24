import { Routes, Route, Navigate, Link } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Cours from "./pages/Cours";
import Vocabulaire from "./pages/Vocabulaire";
import Entrainement from "./pages/Entrainement";
import Quiz from "./pages/Quiz";
import Exo from "./pages/Exo";

function NotFound() {
  return (
    <div className="empty-state stack">
      <p>Cette page n'existe pas.</p>
      <Link className="btn primary" to="/">
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vocabulaire" element={<Vocabulaire />} />
        <Route path="/cours" element={<Cours />} />
        <Route
          path="/grammaire"
          element={<Navigate to="/cours?type=grammaire" replace />}
        />
        <Route
          path="/verbes"
          element={<Navigate to="/cours?type=verbes" replace />}
        />
        <Route path="/entrainement" element={<Entrainement />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/exo" element={<Exo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
