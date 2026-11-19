'use client';
import { useEffect, useRef } from 'react';
import Reveal from '../../components/Reveal';
import ContactForm from '../../components/ContactForm';
import { useLanguage } from '../../components/LanguageContext';
import { contact } from '../../content/i18n';
import { siteConfig, hasSocials } from '../../content/siteConfig';

export default function Contact() {
  const { lang } = useLanguage();
  const t = contact[lang];
  const vidRef = useRef<HTMLVideoElement>(null);
  // Վիդեոն սկսվում է միայն ներածական էկրանը փակվելուց հետո, որ գծագիրը նկարվելը տեսանելի լինի սկզբից
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    // Հեռախոսի և համակարգչի համար առանձին վիդեո (տարբեր կադրավորում)
    const kind = window.matchMedia('(max-width: 850px)').matches ? 'mobile' : 'desktop';
    v.poster = `/contact/apartment-model-${kind}.webp`;
    v.src = `/contact/apartment-model-${kind}.mp4`;
    const start = () => { v.currentTime = 0; v.play().catch(() => {}); };
    if ((window as unknown as { __garonSplashDone?: boolean }).__garonSplashDone || !document.querySelector('.splash')) { start(); return; }
    window.addEventListener('garon:splash-done', start, { once: true });
    return () => window.removeEventListener('garon:splash-done', start);
  }, []);
  return (
    <main className="innerPage">
      <section className="innerHero contactHero">
        {/* Բնակարանի հատակագիծը գծերով դառնում է կահավորված եռաչափ նախագիծ (ծրագրով նկարված անիմացիա) */}
        <video ref={vidRef} className="contactVid" muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
        <div className="innerHeroShade" />
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title1}<br /><span>{t.title2}</span></h1>
          <p>{siteConfig.phone ? t.leadWithPhone : t.lead}</p>
        </div>
      </section>
      <section className="sectionLight contactPage">
        <Reveal className="contactColumns">
          <div>
            <p className="eyebrow dark">{t.getInTouch}</p>
            <h2>{t.title3}<br /><span>{t.title4}</span></h2>
            <div className="contactList">
              {siteConfig.phone && <a href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}><small>{t.phoneLabel}</small><strong>{siteConfig.phone}</strong></a>}
              {siteConfig.email && <a href={`mailto:${siteConfig.email}`}><small>{t.emailLabel}</small><strong>{siteConfig.email}</strong></a>}
              {hasSocials && (
                <div>
                  <small>{t.socialLabel}</small>
                  <p>
                    {siteConfig.instagram && <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a>}
                    {siteConfig.facebook && <a href={siteConfig.facebook} target="_blank" rel="noopener noreferrer">Facebook ↗</a>}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="contactCard"><ContactForm /></div>
        </Reveal>
      </section>
    </main>
  );
}
