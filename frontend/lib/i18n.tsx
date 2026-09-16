"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../locales/en.json";
import ta from "../locales/ta.json";
import hi from "../locales/hi.json";

type Translations = Record<string, string>;

const dictionaries: Record<string, Translations> = {
  en: en as Translations,
  ta: ta as Translations,
  hi: hi as Translations,
};

interface I18nContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => {
    let res = fallback || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        res = res.replace(new RegExp(`{${k}}`, "g"), String(v));
      });
    }
    return res;
  },
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ondemand_lang");
      if (saved && (saved === "en" || saved === "ta" || saved === "hi")) {
        setLangState(saved);
        if (typeof document !== "undefined") {
          document.documentElement.lang = saved;
        }
      }
    } catch {
      // ignore localStorage errors in sandboxed environments
    }
  }, []);

  const setLang = (newLang: string) => {
    setLangState(newLang);
    try {
      localStorage.setItem("ondemand_lang", newLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
      }
    } catch {
      // ignore
    }
  };

  const t = (key: string, fallback?: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[lang] || dictionaries.en;
    let res = dict[key] ?? dictionaries.en[key] ?? fallback ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        res = res.replace(new RegExp(`{${k}}`, "g"), String(v));
      });
    }
    return res;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useLang = () => useContext(I18nContext);
