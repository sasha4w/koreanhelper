/**
 * Lecture audio du coréen via l'API Web Speech du navigateur.
 * Aucune dépendance : repose entièrement sur `speechSynthesis`.
 */

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakKorean(text) {
  if (!canSpeak() || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(String(text));
  utterance.lang = "ko-KR";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
