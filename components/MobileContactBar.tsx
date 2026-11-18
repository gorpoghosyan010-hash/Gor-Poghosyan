'use client';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { contactUi } from '../content/i18n';
import { contactLinks } from '../content/siteConfig';

// Մոբայլ sticky գոտի՝ Զանգել · WhatsApp · Հաշվարկ։ Կոճակը երևում է միայն եթե siteConfig-ում արժեքը լրացված է.
// եթե ոչ հեռախոս, ոչ WhatsApp չկա, գոտին փոքր է՝ «Հաշվարկ» + «Գրել մեզ» (կապի էջ)։
export default function MobileContactBar() {
  const { lang } = useLanguage();
  const t = contactUi[lang];
  const direct = Boolean(contactLinks.tel || contactLinks.whatsapp);
  return (
    <nav className={`mobileBar ${direct ? '' : 'compact'}`} aria-label={t.quick}>
      {contactLinks.tel && <a href={contactLinks.tel} data-event="click_tel"><Icon d={PHONE} />{t.call}</a>}
      {contactLinks.whatsapp && <a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer" data-event="click_whatsapp"><Icon d={CHAT} />{t.whatsapp}</a>}
      {!direct && <Link href="/contact"><Icon d={MAIL} />{t.write}</Link>}
      <Link href="/calculator" className="mobileBarMain"><Icon d={CALC} />{t.estimate}</Link>
    </nav>
  );
}

const PHONE = 'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z';
const CHAT = 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z';
const MAIL = 'M3 6h18v12H3z M3 6l9 7 9-7';
const CALC = 'M6 3h12v18H6z M9 7h6 M9 11h1 M14 11h1 M9 15h1 M14 15h1';
function Icon({ d }: { d: string }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
}
