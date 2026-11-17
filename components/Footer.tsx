'use client';
import Link from 'next/link';
import Logo from './Logo';
import { useLanguage } from './LanguageContext';
import { nav, footer as footerText, contactUi } from '../content/i18n';
import { siteConfig, contactLinks } from '../content/siteConfig';

export default function Footer() {
  const { lang } = useLanguage();
  const t = nav[lang];
  const f = footerText[lang];
  const c = contactUi[lang];
  return <footer className="siteFooter">
    <div><Logo light /></div>
    <div className="footerLinks"><Link href="/about">{t.about}</Link><Link href="/services">{t.services}</Link><Link href="/projects">{t.projects}</Link><Link href="/calculator">{t.calculator}</Link><Link href="/contact">{t.contact}</Link></div>
    <div className="socials footerContacts"><span>{c.contactsLabel}</span>
      {siteConfig.phone && <a href={contactLinks.tel} data-event="click_tel">{siteConfig.phone}</a>}
      {siteConfig.email && <a href={`mailto:${siteConfig.email}`} className="noCaps">{siteConfig.email}</a>}
      {contactLinks.whatsapp && <a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer" data-event="click_whatsapp">WhatsApp ↗</a>}
      {contactLinks.viber && <a href={contactLinks.viber}>Viber ↗</a>}
      {contactLinks.telegram && <a href={contactLinks.telegram} target="_blank" rel="noopener noreferrer">Telegram ↗</a>}
      {siteConfig.instagram && <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram ↗</a>}
      {siteConfig.facebook && <a href={siteConfig.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook ↗</a>}
      <small>{siteConfig.address || c.region}</small>
    </div>
    <p>{f.rights}</p>
  </footer>;
}
