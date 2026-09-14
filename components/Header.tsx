'use client';
import Link from 'next/link';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from './LanguageContext';
import { nav } from '../content/i18n';

export default function Header() {
  const { lang } = useLanguage();
  const t = nav[lang];
  return <header className="siteHeader">
    <Link href="/" className="brand"><Logo light /></Link>
    <nav className="desktopNav">
      <Link href="/about">{t.about}</Link>
      <Link href="/services">{t.services}</Link>
      <Link href="/projects">{t.projects}</Link>
      <Link href="/calculator">{t.calculator}</Link>
      <Link href="/contact">{t.contact}</Link>
    </nav>
    <div className="headerRight">
      <Link className="headerCta" href="/contact">{t.cta} <span>↗</span></Link>
      <LanguageSwitcher />
    </div>
  </header>;
}
