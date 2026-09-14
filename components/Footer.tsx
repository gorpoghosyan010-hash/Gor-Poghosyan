'use client';
import Link from 'next/link';
import Logo from './Logo';
import { useLanguage } from './LanguageContext';
import { nav, footer as footerText } from '../content/i18n';

const instagram = '#';
const facebook = '#';

export default function Footer() {
  const { lang } = useLanguage();
  const t = nav[lang];
  const f = footerText[lang];
  return <footer className="siteFooter">
    <div><Logo light /></div>
    <div className="footerLinks"><Link href="/about">{t.about}</Link><Link href="/services">{t.services}</Link><Link href="/projects">{t.projects}</Link><Link href="/calculator">{t.calculator}</Link><Link href="/contact">{t.contact}</Link></div>
    <div className="socials"><span>{f.followUs}</span><a href={instagram} aria-label="Instagram">Instagram ↗</a><a href={facebook} aria-label="Facebook">Facebook ↗</a></div>
    <p>{f.rights}</p>
  </footer>;
}
