import type { Metadata, Viewport } from 'next';
import { Montserrat, Noto_Sans_Armenian } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Splash from '../components/Splash';
import PageTitle from '../components/PageTitle';
import { LanguageProvider } from '../components/LanguageContext';
import { pageMeta, siteUrl, SITE_NAME } from '../content/seo';
import { siteConfig } from '../content/siteConfig';

// Montserrat-ը հայկական տառեր չունի, ուստի հայերենի համար առանձին (ինքնուրույն հյուրընկալվող) տառատեսակ
const montserrat = Montserrat({ subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--font-montserrat' });
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

export const viewport: Viewport = { themeColor: '#0c0d0e' };

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
const langBoot = "(function(){var d=document.documentElement;try{var l=localStorage.getItem('garon-lang');if(l==='en'||l==='ru'){d.lang=l;d.classList.add('langPending');setTimeout(function(){d.classList.remove('langPending')},2500)}}catch(e){}})();";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy" className={`${montserrat.variable} ${armenian.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: langBoot }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <LanguageProvider>
          <PageTitle />
          <Splash />
          <Header />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
