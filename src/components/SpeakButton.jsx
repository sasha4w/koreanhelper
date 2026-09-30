import { speakKorean } from "../lib/speech";
import { Speaker } from "./Icon";
import "./SpeakButton.css";

/** Bouton icône qui lit un mot coréen à voix haute au clic. */
export default function SpeakButton({ text, className = "" }) {
  if (!text) return null;
  return (
    <button
      type="button"
      className={`speak-btn ${className}`}
      onClick={(e) => {
        e.stopPropagation(); // ne doit pas déclencher le clic du parent (carte, choix…)
        speakKorean(text);
      }}
      aria-label={`Écouter « ${text} »`}
    >
      <Speaker />
    </button>
  );
}
