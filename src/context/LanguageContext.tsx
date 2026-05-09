import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "@/i18n/en.json";
import kn from "@/i18n/kn.json";

export type Language = "en" | "kn";
type Dict = Record<string, string>;

const dictionaries: Record<Language, Dict> = {
  en: en as Dict,
  kn: kn as Dict,
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const defaultValue: LanguageContextValue = {
  language: "kn",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, vars?: Record<string, string | number>) => {
    let str = (dictionaries.en as Dict)[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return str;
  },
};

const LanguageContext = createContext<LanguageContextValue>(defaultValue);

const STORAGE_KEY = "language";

const readInitial = (): Language => {
  if (typeof window === "undefined") return "kn";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : "kn";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
      document.documentElement.lang = language;
      window.dispatchEvent(new CustomEvent("yojana-language-change", { detail: { language } }));
    } catch {
      /* ignore */
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const setLanguage = (lang: Language) => setLanguageState(lang);
    const toggleLanguage = () => setLanguageState((prev) => (prev === "en" ? "kn" : "en"));
    const t = (key: string, vars?: Record<string, string | number>) => {
      const dict = dictionaries[language] || dictionaries.en;
      let str = dict[key] ?? (language === "kn" ? "" : dictionaries.en[key]) ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    };
    return { language, setLanguage, toggleLanguage, t };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

// Convenience hook returning just the translator
export const useTranslation = () => {
  const { t } = useLanguage();
  return t;
};
