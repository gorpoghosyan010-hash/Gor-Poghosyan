'use client';

import Link from 'next/link';
import { localeNames, locales, localizePath, type Locale } from '@/lib/i18n';

export default function LanguageSwitcher({ locale, base, label }: { locale: Locale; base: string; label: string }) {
  return (
    <nav aria-label={label} className="flex items-center gap-1 font-mono text-[11px] tracking-[0.14em]">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="text-dust">/</span>}
          <Link
            href={localizePath(l, base)}
            hrefLang={l}
            lang={l}
            aria-current={l === locale ? 'true' : undefined}
            aria-label={localeNames[l].long}
            className={`px-1 py-1 transition-colors ${l === locale ? 'text-bronze' : 'text-sand hover:text-stone'}`}
            scroll={false}
          >
            {localeNames[l].short}
          </Link>
        </span>
      ))}
    </nav>
  );
}
