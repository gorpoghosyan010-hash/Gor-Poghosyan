'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from './LanguageContext';
import { nav } from '../content/i18n';

export default function Header() {
  const { lang } = useLanguage();
  const t = nav[lang];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  const links = [
    ['/about', t.about], ['/services', t.services], ['/projects', t.projects], ['/calculator', t.calculator], ['/contact', t.contact]
  ] as const;

  return <>
    <header className={`siteHeader ${scrolled ? 'scrolled' : ''} ${open ? 'menuOpen' : ''}`}>
      <Link href="/" className="brand"><Logo light /></Link>
      <nav className="desktopNav" aria-label="Main">
        {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <div className="headerRight">
        <Link className="headerCta" href="/contact">{t.cta} <span>↗</span></Link>
        <LanguageSwitcher />
        <button type="button" className="menuToggle" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="mobileMenu" aria-label={open ? t.close : t.menu}>
          <span /><span />
        </button>
      </div>
    </header>
    <div id="mobileMenu" className={`mobileMenu ${open ? 'open' : ''}`} aria-hidden={!open}>
      <nav aria-label="Mobile">
        <Link href="/" tabIndex={open ? 0 : -1}>{t.home}</Link>
        {links.map(([href, label]) => <Link key={href} href={href} tabIndex={open ? 0 : -1}>{label}</Link>)}
      </nav>
      <Link className="button gold" href="/contact" tabIndex={open ? 0 : -1}>{t.cta} ↗</Link>
    </div>
  </>;
}
