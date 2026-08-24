import { useLayoutEffect, useRef, useState } from "react";

/**
 * Fait suivre à un input sa largeur de contenu, pour qu'un texte tapé ne se
 * retrouve jamais masqué par le défilement interne d'un champ trop étroit.
 * Mesure un `<span>` miroir invisible portant la même police.
 *
 * @param {string} value texte actuellement affiché dans l'input
 * @param {{ min?: number, extra?: number }} options min/extra en pixels
 * @returns {{ width: number, mirrorRef: import("react").RefObject }}
 */
export function useAutoWidth(value, { min = 64, extra = 24 } = {}) {
  const mirrorRef = useRef(null);
  const [width, setWidth] = useState(min);

  useLayoutEffect(() => {
    if (!mirrorRef.current) return;
    const measured = mirrorRef.current.offsetWidth + extra;
    setWidth(Math.max(measured, min));
  }, [value, min, extra]);

  return { width, mirrorRef };
}
