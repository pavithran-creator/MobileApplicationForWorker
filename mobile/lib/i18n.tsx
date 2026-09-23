import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  language: string;
  setLang: (lang: string) => void;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  language: "en",
  setLang: () => {},
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export interface LanguageOption {
  code: string;
  label: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English (EN)", native: "Default Interface" },
  { code: "ta", label: "தமிழ் (Tamil)", native: "தமிழ்நாடு அரசு பதிவு" },
  { code: "hi", label: "हिन्दी (Hindi)", native: "सहकारी मंच" },
];

export function MobileLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>("en");

  useEffect(() => {
    AsyncStorage.getItem("ondemand_mobile_lang").then((saved) => {
      if (saved && (saved === "en" || saved === "ta" || saved === "hi")) {
        setLangState(saved);
      }
    });
  }, []);

  const setLang = (newLang: string) => {
    if (newLang === "en" || newLang === "ta" || newLang === "hi") {
      setLangState(newLang);
      AsyncStorage.setItem("ondemand_mobile_lang", newLang);
    }
  };

  const t = (key: string, fallback?: string, params?: Record<string, string | number>): string => {
    const currentDict = dictionaries[lang] || dictionaries.en;
    let res = currentDict[key] ?? dictionaries.en[key] ?? fallback ?? key;

    if (params && typeof res === "string") {
      Object.entries(params).forEach(([k, v]) => {
        res = res.replace(new RegExp(`{${k}}`, "g"), String(v));
      });
    }
    return res;
  };

  return (
    <I18nContext.Provider
      value={{
        lang,
        language: lang,
        setLang,
        setLanguage: setLang,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export const useLang = () => useContext(I18nContext);
export const useI18n = () => useContext(I18nContext);

