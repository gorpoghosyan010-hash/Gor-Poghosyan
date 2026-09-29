import Link from 'next/link';
import type { Dictionary } from '@/content/dictionaries/en';
import { site, telHref } from '@/content/site';
import { localizePath, type Locale } from '@/lib/i18n';

const links = ['projects', 'services', 'about', 'process', 'contact'] as const;

export default function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t hairline pt-20">
      <div className="px-gutter grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow mb-6">{t.footer.tagline}</p>
          <p className="display-md max-w-md text-stone">{t.hero.quote}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-2 md:col-start-7">
          <ul className="flex flex-col gap-2 text-sm">
            {links.map((key) => (
              <li key={key}>
                <Link href={localizePath(locale, `/${key}`)} className="link-line text-sand hover:text-stone">
                  {t.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2 text-sm md:col-span-3">
          <span className="label mb-2">{t.footer.write}</span>
          <a href={`mailto:${site.email}`} className="link-line w-fit text-stone">
            {site.email}
          </a>
          {site.phone && (
            <a href={telHref(site.phone)} className="link-line w-fit text-stone">
              {site.phone}
            </a>
          )}
          <span className="text-sand">{t.common.yerevan}</span>
          {(site.instagram || site.facebook) && (
            <div className="mt-4 flex gap-5">
              {site.instagram && (
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="link-line text-sand hover:text-stone">
                  Instagram
                </a>
              )}
              {site.facebook && (
                <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="link-line text-sand hover:text-stone">
                  Facebook
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-gutter mt-20 flex flex-wrap items-center justify-between gap-4 border-t hairline py-6 font-mono text-[11px] tracking-[0.14em] text-dust">
        <span>{t.footer.rights.replace('{year}', String(year))}</span>
        <span>{site.coordinates.label}</span>
        <a href="#main" className="hover:text-stone">
          {t.footer.backToTop} ↑
        </a>
      </div>

      <div aria-hidden className="pointer-events-none select-none px-gutter">
        <div className="outline-text translate-y-[18%] text-center font-display text-[25vw] font-light leading-[0.78] tracking-[-0.04em]">
          GARON
        </div>
      </div>
    </footer>
  );
}
