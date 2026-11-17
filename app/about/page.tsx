'use client';
import PageHero from '../../components/PageHero';
import Link from 'next/link'; import Reveal from '../../components/Reveal';
import { useLanguage } from '../../components/LanguageContext';
import { about } from '../../content/i18n';
export default function About(){
 const { lang } = useLanguage();
 const t = about[lang];
 return <main className="innerPage"><PageHero image="/projects/house-01/11.webp" eyebrow={t.eyebrow} title1={t.title1} title2={t.title2} lead={t.lead}/><section className="sectionLight story"><Reveal className="twoCol"><div><p className="eyebrow dark">{t.pathEyebrow}</p><h2>{t.pathTitle1}<br/><span>{t.pathTitle2}</span></h2></div><div className="copy"><p>{t.pathText1}</p><p>{t.pathText2}</p></div></Reveal></section><section className="sectionDark values"><Reveal><p className="eyebrow">{t.valuesEyebrow}</p><div className="valueGrid">{t.values.map((v,i)=><article key={v.t}><b>{String(i+1).padStart(2,'0')}</b><h3>{v.t}</h3><p>{v.d}</p></article>)}</div></Reveal></section><section className="sectionLight pageCta"><Reveal><p className="eyebrow dark">{t.nextEyebrow}</p><h2>{t.nextTitle1}<br/><span>{t.nextTitle2}</span></h2><Link className="button gold" href="/projects">{t.nextCta}</Link></Reveal></section></main>;
}
