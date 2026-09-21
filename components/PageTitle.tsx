'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { pageMeta, pageKey, SITE_NAME } from '../content/seo';

// Սերվերը տալիս է հայերեն վերնագիր (որոնողների համար), իսկ այստեղ այն համապատասխանեցվում է այցելուի լեզվին
export default function PageTitle() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  useEffect(() => {
    const key = pageKey(pathname);
    if (!key) return;
    const m = pageMeta[key][lang];
    document.title = key === '/' ? m.title : `${m.title} | ${SITE_NAME}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', m.description);
  }, [pathname, lang]);
  return null;
}
