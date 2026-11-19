'use client';
import Link from 'next/link';
import Logo from './Logo';
import { useLanguage } from './LanguageContext';
import { nav, footer as footerText } from '../content/i18n';
import { siteConfig, hasSocials } from '../content/siteConfig';

export default function Footer() {
  const { lang } = useLanguage();
  const t = nav[lang];
  const f = footerText[lang];
  return <footer className={`siteFooter ${hasSocials ? '' : 'noSocials'}`}>
    <div><Logo light /></div>
    <div className="footerLinks"><Link href="/about">{t.about}</Link><Link href="/services">{t.services}</Link><Link href="/projects">{t.projects}</Link><Link href="/calculator">{t.calculator}</Link><Link href="/contact">{t.contact}</Link></div>
    {hasSocials && <div className="socials"><span>{f.followUs}</span>
      {siteConfig.instagram && <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram ↗</a>}
      {siteConfig.facebook && <a href={siteConfig.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook ↗</a>}
    </div>}
    <p>{f.rights}</p>
  </footer>;
}
