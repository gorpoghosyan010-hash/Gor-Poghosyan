'use client'; import Reveal from '../../components/Reveal';
import { useLanguage } from '../../components/LanguageContext';
import { contact } from '../../content/i18n';
const phone='+374 91 000 000'; const email='info@garon.am';
export default function Contact(){
 const { lang } = useLanguage();
 const t = contact[lang];
 return <main className="innerPage"><section className="innerHero contactHero"><div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title1}<br/><span>{t.title2}</span></h1><p>{t.lead}</p></div></section><section className="sectionLight contactPage"><Reveal className="contactColumns"><div><p className="eyebrow dark">{t.getInTouch}</p><h2>{t.title3}<br/><span>{t.title4}</span></h2><div className="contactList"><a href={`tel:${phone.replace(/\s/g,'')}`}><small>{t.phoneLabel}</small><strong>{phone}</strong></a><a href={`mailto:${email}`}><small>{t.emailLabel}</small><strong>{email}</strong></a><div><small>{t.socialLabel}</small><p><a href="#">Instagram ↗</a> <a href="#">Facebook ↗</a></p></div></div></div><div className="contactCard"><p>{t.cardText}</p><a className="button gold" href={`mailto:${email}?subject=GARON%20Construction%20Inquiry`}>{t.send}</a><span>{t.note}</span></div></Reveal></section></main>;
}
