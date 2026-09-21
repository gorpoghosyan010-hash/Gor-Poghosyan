'use client';
import { useEffect, useRef, useState } from 'react';
import { useLanguage, type Lang } from './LanguageContext';
import { languageNames } from '../content/i18n';

const order: Lang[] = ['hy', 'en', 'ru'];

function Flag({ lang }: { lang: Lang }) {
  if (lang === 'hy') return (
    <svg viewBox="0 0 24 16" width="22" height="15"><rect width="24" height="16" fill="#D90012"/><rect width="24" height="10.67" y="0" fill="#D90012"/><rect width="24" height="5.33" y="5.33" fill="#0033A0"/><rect width="24" height="5.33" y="10.67" fill="#F2A800"/></svg>
  );
  if (lang === 'ru') return (
    <svg viewBox="0 0 24 16" width="22" height="15"><rect width="24" height="16" fill="#D52B1E"/><rect width="24" height="10.67" fill="#0039A6"/><rect width="24" height="5.33" fill="#FFFFFF"/></svg>
  );
  return (
    <svg viewBox="0 0 24 16" width="22" height="15">
      <rect width="24" height="16" fill="#B22234"/>
      <rect width="24" height="1.23" y="1.23" fill="#fff"/><rect width="24" height="1.23" y="3.69" fill="#fff"/>
      <rect width="24" height="1.23" y="6.15" fill="#fff"/><rect width="24" height="1.23" y="8.62" fill="#fff"/>
      <rect width="24" height="1.23" y="11.08" fill="#fff"/><rect width="24" height="1.23" y="13.54" fill="#fff"/>
      <rect width="10" height="8.62" fill="#3C3B6E"/>
    </svg>
  );
}

const labels: Record<Lang, string> = { hy: 'ՀԱՅ', en: 'ENG', ru: 'РУС' };

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, []);

  const others = order.filter(l => l !== lang);

  return (
    <div className="langSwitch" ref={ref}>
      <button type="button" className="langCurrent" onClick={() => setOpen(o => !o)} aria-label={`Language: ${languageNames[lang]}`} aria-haspopup="true" aria-expanded={open}>
        <Flag lang={lang} /><span>{labels[lang]}</span><i className={open ? 'up' : 'down'} />
      </button>
      {open && <div className="langOptions">
        {others.map(l => <button type="button" key={l} lang={l} aria-label={languageNames[l]} onClick={() => { setLang(l); setOpen(false); }}><Flag lang={l} /><span>{labels[l]}</span></button>)}
      </div>}
    </div>
  );
}
