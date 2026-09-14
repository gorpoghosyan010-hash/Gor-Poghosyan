'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'hy' | 'en' | 'ru';
const STORAGE_KEY = 'garon-lang';

const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'hy',
  setLang: () => {}
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('hy');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === 'hy' || saved === 'en' || saved === 'ru') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
