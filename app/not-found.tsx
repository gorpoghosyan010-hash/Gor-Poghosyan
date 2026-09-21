'use client';
import Link from 'next/link';
import { useLanguage } from '../components/LanguageContext';
import { notFound } from '../content/i18n';

export default function NotFound() {
  const { lang } = useLanguage();
  const t = notFound[lang];
  return (
    <main className="innerPage">
      <section className="innerHero">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.text}</p>
          <div className="actions">
            <Link className="button gold" href="/">{t.home}</Link>
            <Link className="quietLink" href="/projects">{t.projects}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
