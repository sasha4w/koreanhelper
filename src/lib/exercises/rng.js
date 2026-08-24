/** Générateur pseudo-aléatoire seedé (mulberry32) — sessions reproductibles. */
export function makeRng(seed = Date.now()) {
  let a = seed >>> 0;

  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /** Entier dans [0, max) */
  next.int = (max) => Math.floor(next() * max);

  /** Élément au hasard */
  next.pick = (arr) => (arr.length ? arr[next.int(arr.length)] : undefined);

  /** Fisher-Yates — non biaisé, contrairement à sort(() => Math.random() - 0.5) */
  next.shuffle = (arr) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = next.int(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  /** n éléments distincts au hasard */
  next.sample = (arr, n) => next.shuffle(arr).slice(0, n);

  return next;
}
