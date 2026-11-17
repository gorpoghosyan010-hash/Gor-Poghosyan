'use client';
import Reveal from '../../components/Reveal';
import ContactForm from '../../components/ContactForm';
import { useLanguage } from '../../components/LanguageContext';
import { contact, contactUi } from '../../content/i18n';
import { siteConfig, hasSocials, contactLinks, hasMessengers } from '../../content/siteConfig';

export default function Contact() {
  const { lang } = useLanguage();
  const t = contact[lang];
  const c = contactUi[lang];
  return (
    <main className="innerPage">
      <section className="innerHero contactHero" style={{ backgroundImage: "url('/projects/pool-05/01.webp')" }}>
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
              {siteConfig.phone && <a href={contactLinks.tel} data-event="click_tel"><small>{t.phoneLabel}</small><strong>{siteConfig.phone}</strong></a>}
              {hasMessengers && (
                <div>
                  <small>{c.messengersLabel}</small>
                  <p>
                    {contactLinks.whatsapp && <a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer" data-event="click_whatsapp">WhatsApp ↗</a>}
                    {contactLinks.viber && <a href={contactLinks.viber}>Viber ↗</a>}
                    {contactLinks.telegram && <a href={contactLinks.telegram} target="_blank" rel="noopener noreferrer">Telegram ↗</a>}
                  </p>
                </div>
              )}
              {siteConfig.email && <a href={`mailto:${siteConfig.email}`}><small>{t.emailLabel}</small><strong>{siteConfig.email}</strong></a>}
              {siteConfig.address ? (
                <div>
                  <small>{c.addressLabel}</small>
                  <strong>{siteConfig.address}</strong>
                  <p><a href={contactLinks.map} target="_blank" rel="noopener noreferrer">{c.openMap}</a></p>
                </div>
              ) : (
                <div><small>{c.areaLabel}</small><strong>{c.region}</strong></div>
              )}
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
