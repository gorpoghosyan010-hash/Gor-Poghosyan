import type { Metadata, Viewport } from 'next';
import { Noto_Sans, Noto_Sans_Armenian } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Splash from '../components/Splash';
import PageTitle from '../components/PageTitle';
import MobileContactBar from '../components/MobileContactBar';
import ScrollFx from '../components/ScrollFx';
import { LanguageProvider } from '../components/LanguageContext';
import { pageMeta, siteUrl, SITE_NAME } from '../content/seo';
import { siteConfig } from '../content/siteConfig';

// Մեկ ընտանիք երեք լեզվի համար՝ Noto Sans (լատինական + կիրիլիցա) և Noto Sans Armenian (նույն մետրիկա)
const latin = Noto_Sans({ subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--font-latin' });
const armenian = Noto_Sans_Armenian({ subsets: ['armenian'], display: 'swap', variable: '--font-armenian' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: pageMeta['/'].hy.title, template: `%s | ${SITE_NAME}` },
  description: pageMeta['/'].hy.description,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: { siteName: SITE_NAME, type: 'website', locale: 'hy_AM', alternateLocale: ['en_US', 'ru_RU'] },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = { themeColor: '#f5f5f3' };

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'GeneralContractor',
  name: SITE_NAME,
  url: siteUrl,
  description: pageMeta['/'].hy.description,
  areaServed: 'Armenia',
  address: { '@type': 'PostalAddress', addressLocality: 'Yerevan', addressCountry: 'AM' },
  ...(siteConfig.email ? { email: siteConfig.email } : {}),
  ...(siteConfig.phone ? { telephone: siteConfig.phone } : {}),
  ...(siteConfig.instagram || siteConfig.facebook ? { sameAs: [siteConfig.instagram, siteConfig.facebook].filter(Boolean) } : {})
};

// Ընտրված (ոչ հայերեն) լեզվի դեպքում էջը թաքցվում է մինչև լեզվի կիրառումը՝ հայերենի կարճ «առկայծումից» խուսափելու համար
// Splash՝ միայն սեսիայի առաջին էջում և առանց prefers-reduced-motion-ի (առանց JS-ի՝ երբեք)
const langBoot = "(function(){var d=document.documentElement;try{var l=localStorage.getItem('garon-lang');if(l==='en'||l==='ru'){d.lang=l;d.classList.add('langPending');setTimeout(function(){d.classList.remove('langPending')},2500)}}catch(e){}try{if(!sessionStorage.getItem('garon-splash-seen')&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){d.classList.add('splashOn');setTimeout(function(){d.classList.remove('splashOn')},1500)}}catch(e){}})();";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy" className={`${latin.variable} ${armenian.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: langBoot }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <LanguageProvider>
          <PageTitle />
          <Splash />
          <ScrollFx />
          <Header />
          {children}
          <Footer />
          <MobileContactBar />
        </LanguageProvider>
      </body>
    </html>
  );
}
