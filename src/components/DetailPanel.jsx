import { createPortal } from "react-dom";
import { ChevronRight } from "./Icon";
import "./DetailPanel.css";

/**
 * Panneau plein écran qui glisse par-dessus la grille pour montrer le
 * détail d'un thème/chapitre — reste monté en permanence (translaté hors
 * écran quand fermé) pour garder l'animation de fermeture fluide.
 *
 * Rendu via portail dans document.body : un `position: fixed` descendant
 * d'un élément animé (`.page-transition`, qui anime `transform`) serait
 * positionné par rapport à CET ancêtre plutôt qu'au vrai viewport — un
 * piège CSS classique des modales/overlays. Le portail sort le panneau de
 * cette hiérarchie DOM, donc `inset: 0` vise bien tout l'écran.
 */
export default function DetailPanel({ open, title, subtitle, onClose, children }) {
  return createPortal(
    <div className={`detail-panel ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="detail-panel-header">
        <button
          type="button"
          className="detail-panel-back"
          onClick={onClose}
          aria-label="Retour"
          tabIndex={open ? 0 : -1}
        >
          <ChevronRight />
        </button>
        <span className="detail-panel-titles">
          <span className="detail-panel-title">{title}</span>
          {subtitle && <span className="detail-panel-subtitle">{subtitle}</span>}
        </span>
      </div>
      <div className="detail-panel-body">{children}</div>
    </div>,
    document.body,
  );
}
