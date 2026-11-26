import { createContext, useCallback, useContext, useMemo, useState } from "react";
import fr from "./fr";
import en from "./en";

const DICTS = { fr, en };
const STORAGE_KEY = "kh:lang";

function format(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

function makeT(lang) {
  const dict = DICTS[lang] || fr;
  return (key, vars) => format(dict[key] ?? fr[key] ?? key, vars);
}

/** Valeur par défaut : utilisable sans Provider (français, langue fixe). */
const LangContext = createContext({ lang: "fr", setLang: () => {}, t: makeT("fr") });

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && DICTS[saved] ? saved : "fr";
  } catch {
    return "fr";
  }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  const setLang = useCallback((next) => {
    if (!DICTS[next]) return;
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // stockage indisponible : la langue ne survivra pas au rechargement
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: makeT(lang) }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  return useContext(LangContext);
}
