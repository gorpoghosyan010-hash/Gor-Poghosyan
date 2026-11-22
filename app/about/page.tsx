'use client';
import Link from 'next/link'; import Reveal from '../../components/Reveal';
import { useLanguage } from '../../components/LanguageContext';
import { about } from '../../content/i18n';
const n = (i: number) => String(i + 1).padStart(2, '0');
export default function About(){
 const { lang } = useLanguage();
 const t = about[lang];
 return <main className="innerPage">
  <section className="innerHero aboutHero" style={{backgroundImage:"url('/projects/house-01/12.webp')"}}><div className="innerHeroShade"/><div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title1}<br/><span>{t.title2}</span></h1><p className="aboutLead">{t.lead}</p><p>{t.sub}</p></div></section>
  <section className="sectionLight story"><Reveal className="twoCol"><div><p className="eyebrow dark">{t.pathEyebrow}</p><h2>{t.pathTitle1}<br/><span>{t.pathTitle2}</span></h2></div><div className="copy"><p>{t.pathText1}</p><p>{t.pathText2}</p></div></Reveal></section>
  <section className="sectionDark aboutSteps"><Reveal><p className="eyebrow">{t.stepsEyebrow}</p><h2>{t.stepsTitle1}<br/><span>{t.stepsTitle2}</span></h2></Reveal><ol className="stepLine">{t.steps.map((s,i)=><li key={s.t}><Reveal delay={i*80}><b>{n(i)}</b><div><h3>{s.t}</h3><p>{s.d}</p></div></Reveal></li>)}</ol></section>
  <section className="sectionLight aboutGets"><Reveal><p className="eyebrow dark">{t.getEyebrow}</p><h2>{t.getTitle1}<br/><span>{t.getTitle2}</span></h2></Reveal><div className="getGrid">{t.gets.map((g,i)=><Reveal key={g.t} delay={i*80}><article><b>{n(i)}</b><h3>{g.t}</h3><p>{g.d}</p></article></Reveal>)}</div></section>
  <section className="sectionDark values"><Reveal><p className="eyebrow">{t.valuesEyebrow}</p><div className="valueGrid">{t.values.map((v,i)=><article key={v.t}><b>{n(i)}</b><h3>{v.t}</h3><p>{v.d}</p></article>)}</div></Reveal></section>
  <section className="sectionLight pageCta"><Reveal><p className="eyebrow dark">{t.nextEyebrow}</p><h2>{t.nextTitle1}<br/><span>{t.nextTitle2}</span></h2><div className="ctaPair"><Link className="button gold" href="/projects">{t.nextCta}</Link><Link className="button darkButton" href="/booking">{t.nextCta2}</Link></div></Reveal></section>
 </main>;
}
