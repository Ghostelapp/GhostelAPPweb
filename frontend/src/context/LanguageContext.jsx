import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext(null);
const supportedLanguages = ["pl", "en", "de"];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("ghostel_lang");
    return supportedLanguages.includes(saved) ? saved : "pl";
  });

  useEffect(() => {
    localStorage.setItem("ghostel_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (path) => {
    const parts = path.split(".");
    let value = translations[lang];
    for (const p of parts) {
      value = value?.[p];
    }
    return value ?? path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be inside LanguageProvider");
  return ctx;
}
