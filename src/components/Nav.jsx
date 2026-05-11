import { NavLink } from "react-router-dom";
import "./Nav.css";
export default function Nav() {
  return (
    <div className="nav">
      <NavLink
        to="/verbes"
        className={({ isActive }) => (isActive ? "active" : "inactive")}
      >
        🔤 Terminaisons verbales
      </NavLink>

      <NavLink
        to="/grammaire"
        className={({ isActive }) => (isActive ? "active" : "inactive")}
      >
        🧩 Grammaire
      </NavLink>

      <NavLink
        to="/vocabulaire"
        className={({ isActive }) => (isActive ? "active" : "inactive")}
      >
        📖 Vocabulaire
      </NavLink>
      <NavLink
        to="/quiz"
        className={({ isActive }) => (isActive ? "active" : "inactive")}
      >
        🧠 Quiz
      </NavLink>
    </div>
  );
}
