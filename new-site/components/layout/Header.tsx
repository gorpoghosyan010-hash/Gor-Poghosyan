'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { localizePath, stripLocale, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/content/dictionaries/en';
import LanguageSwitcher from './LanguageSwitcher';
import { telHref } from '@/content/site';

type Props = {
  locale: Locale;
  nav: Dictionary['nav'];
  contact: { email: string; phone: string; instagram: string; facebook: string };
};

const links = ['projects', 'services', 'about', 'process', 'contact'] as const;
const ease = [0.16, 1, 0.3, 1] as const;

export default function Header({ locale, nav, contact }: Props) {
  const pathname = usePathname() || '/';
  const base = stripLocale(pathname);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 240 && y > lastY.current + 2);
      if (y < lastY.current - 2) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (key: string) => base === `/${key}` || base.startsWith(`/${key}/`);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-700 ease-(--ease-expo) ${
          hidden && !open ? '-translate-y-full' : 'translate-y-0'
        } ${scrolled && !open ? 'glass border-x-0 border-t-0' : 'border-b border-transparent'}`}
      >
        <div className="px-gutter flex h-(--header-h) items-center justify-between gap-8">
          <Link href={localizePath(locale, '/')} aria-label="GARON — Home" className="relative z-10 flex shrink-0 items-center">
            <Image src="/media/brand/garon-logo-white.png" alt="GARON Construction" width={425} height={310} priority className="h-12 w-auto md:h-14" />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
            {links.map((key, i) => (
              <Link
                key={key}
                href={localizePath(locale, `/${key}`)}
                aria-current={isActive(key) ? 'page' : undefined}
                className="link-line group flex items-baseline gap-2 pb-1 text-[13px] tracking-[0.04em] text-stone/85 transition-colors hover:text-stone"
              >
                <span className="font-mono text-[10px] text-bronze/80">0{i + 1}</span>
                {nav[key]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <div className="hidden lg:block">
              <LanguageSwitcher locale={locale} base={base} label={nav.language} />
            </div>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? nav.closeMenu : nav.openMenu}
              className="relative z-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] lg:hidden"
            >
              <span>{open ? '' : nav.menu}</span>
              <span aria-hidden className="relative block h-3 w-7">
                <span className={`absolute left-0 top-0 h-px w-full bg-stone transition-transform duration-500 ${open ? 'translate-y-1.5 rotate-45' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-px w-full bg-stone transition-transform duration-500 ${open ? '-translate-y-1.5 -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={nav.menu}
            className="fixed inset-0 z-40 flex flex-col bg-ink pt-(--header-h) lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.9, ease }}
          >
            <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
            <nav aria-label="Mobile" className="px-gutter relative flex flex-1 flex-col justify-center gap-1">
              {links.map((key, i) => (
                <div key={key} className="overflow-hidden border-b hairline">
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.06 }}
                  >
                    <Link
                      href={localizePath(locale, `/${key}`)}
                      aria-current={isActive(key) ? 'page' : undefined}
                      className="flex items-baseline gap-4 py-3 font-display text-[clamp(34px,10vw,72px)] font-light leading-none aria-[current=page]:text-bronze-soft"
                    >
                      <span className="font-mono text-[11px] text-bronze">0{i + 1}</span>
                      {nav[key]}
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <motion.div
              className="px-gutter relative flex flex-wrap items-end justify-between gap-6 pb-10 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.55 } }}
              exit={{ opacity: 0 }}
            >
              <LanguageSwitcher locale={locale} base={base} label={nav.language} />
              <div className="flex flex-col items-end gap-1 text-sm text-sand">
                <a href={`mailto:${contact.email}`} className="hover:text-stone">{contact.email}</a>
                {contact.phone && <a href={telHref(contact.phone)} className="hover:text-stone">{contact.phone}</a>}
                <div className="flex gap-4">
                  {contact.instagram && <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-stone">Instagram</a>}
                  {contact.facebook && <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-stone">Facebook</a>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
