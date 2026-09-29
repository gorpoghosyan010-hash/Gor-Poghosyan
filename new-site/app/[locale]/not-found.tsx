'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import en from '@/content/dictionaries/en';
import hy from '@/content/dictionaries/hy';
import ru from '@/content/dictionaries/ru';
import { localizePath, type Locale } from '@/lib/i18n';
import VillaElevation from '@/components/drawings/VillaElevation';

const text = { hy: hy.notFound, en: en.notFound, ru: ru.notFound };

// Client-side so every real page can stay statically generated (not-found receives no params).
export default function NotFound() {
  const seg = (usePathname() || '/').split('/')[1];
  const locale: Locale = seg === 'en' || seg === 'ru' ? seg : 'hy';
  const t = text[locale];

  return (
    <section className="px-gutter flex min-h-[100svh] flex-col items-start justify-center gap-8 pt-(--header-h)">
      <VillaElevation className="w-[min(80vw,440px)] text-bronze/60" />
      <p className="eyebrow">404</p>
      <h1 className="display-lg max-w-3xl">{t.title}</h1>
      <p className="lead">{t.text}</p>
      <div className="flex flex-wrap gap-4">
        <Link href={localizePath(locale, '/')} className="btn-round">
          {t.home}
        </Link>
        <Link href={localizePath(locale, '/projects')} className="btn-round btn-solid">
          {t.projects}
        </Link>
      </div>
    </section>
  );
}
