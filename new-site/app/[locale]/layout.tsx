import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope, Noto_Sans_Armenian, Noto_Serif_Armenian } from 'next/font/google';
import '../globals.css';
import { getDictionary } from '@/content/dictionaries';
import { site } from '@/content/site';
import { isLocale, locales, localizePath } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { siteUrl } from '@/lib/site-url';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Loader from '@/components/layout/Loader';
import Cursor from '@/components/layout/Cursor';

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap'
});
const serifHy = Noto_Serif_Armenian({ subsets: ['armenian'], weight: ['300', '400', '500'], variable: '--font-serif-hy', display: 'swap' });
const manrope = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-manrope', display: 'swap' });
const sansHy = Noto_Sans_Armenian({ subsets: ['armenian'], variable: '--font-sans-hy', display: 'swap' });
const plex = IBM_Plex_Mono({ subsets: ['latin', 'cyrillic'], weight: ['400', '500'], variable: '--font-plex', display: 'swap' });

export const viewport: Viewport = {
  themeColor: '#0b0a09',
  colorScheme: 'dark'
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    ...pageMetadata({ locale, path: '/', description: t.meta.description }),
    title: { default: t.meta.siteTitle, template: '%s — GARON' },
    icons: { icon: '/icon.png', apple: '/apple-icon.png' }
  };
}

// Runs before paint: skip the intro loader for the rest of the session once it has played.
const loaderScript = `try{if(sessionStorage.getItem('garon-intro'))document.documentElement.setAttribute('data-seen','')}catch(e){}`;

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: site.name,
    url: `${siteUrl}${localizePath(locale, '/')}`,
    logo: `${siteUrl}/media/brand/garon-logo-white.png`,
    image: `${siteUrl}/media/og.jpg`,
    email: site.email,
    ...(site.phone ? { telephone: site.phone } : {}),
    foundingDate: String(site.founded),
    description: t.meta.description,
    address: { '@type': 'PostalAddress', addressLocality: 'Yerevan', addressCountry: 'AM' },
    geo: { '@type': 'GeoCoordinates', latitude: site.coordinates.lat, longitude: site.coordinates.lng },
    areaServed: 'Armenia',
    sameAs: [site.instagram, site.facebook].filter(Boolean)
  };

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${serifHy.variable} ${manrope.variable} ${sansHy.variable} ${plex.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-stone focus:px-4 focus:py-2 focus:text-ink"
        >
          {t.nav.skip}
        </a>
        <Loader line={t.loader.line} />
        <Header locale={locale} nav={t.nav} contact={{ email: site.email, phone: site.phone, instagram: site.instagram, facebook: site.facebook }} />
        <main id="main">{children}</main>
        <Footer locale={locale} t={t} />
        <Cursor />
      </body>
    </html>
  );
}
