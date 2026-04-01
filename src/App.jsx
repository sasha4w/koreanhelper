import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Verbes from "./pages/Verbes";
import Grammaire from "./pages/Grammaire";
import Vocabulaire from "./pages/Vocabulaire";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Verbes />} />
        <Route path="/verbes" element={<Verbes />} />
        <Route path="/grammaire" element={<Grammaire />} />
        <Route path="/vocabulaire" element={<Vocabulaire />} />
      </Routes>
    </Layout>
  );
}
