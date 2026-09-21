'use client';
import Link from 'next/link';
import Reveal from '../components/Reveal';
import ProjectCard from '../components/ProjectCard';
import Hero3D from '../components/Hero3D';
import { useLanguage } from '../components/LanguageContext';
import { home, common } from '../content/i18n';

const serviceMeta = [
 ['01','/services/pools','/services/pools.webp'],
 ['02','/services/residential','/services/residential.webp'],
 ['03','/services/renovation','/services/renovation.webp'],
 ['04','/services/public-works','/services/public-works.webp']
];

export default function Home(){
 const { lang } = useLanguage();
 const t = home[lang];
 return <main>
 <section className="homeHero"><div className="heroPhoto"/><div className="heroTexture"/><div className="heroGlow"/><Hero3D />
  <div className="heroContent"><Reveal><p className="eyebrow">{t.heroEyebrow}</p><h1>{t.heroTitle1}<br/><span>{t.heroTitle2}</span></h1><p className="heroLead">{t.heroLead}</p><div className="actions"><Link className="button gold" href="/projects">{t.viewWork}</Link><Link className="quietLink" href="/contact">{t.startProject}</Link></div></Reveal></div>
  <div className="heroSignature"><span>{t.heroSig1}</span><span>{t.heroSig2}</span></div>
 </section>
 <section className="trustStrip"><div><strong>25+</strong><span>{t.trust1Label}</span></div><div><strong>50+</strong><span>{t.trust2Label}</span></div><div><strong>50+</strong><span>{t.trust3Label}</span></div></section>
 <section className="homeIntro sectionLight"><Reveal className="twoCol"><div><p className="eyebrow dark">{t.philosophyEyebrow}</p><h2>{t.philosophyTitle1}<br/><span>{t.philosophyTitle2}</span></h2></div><div className="copy"><p>{t.philosophyText}</p><Link className="lineLink" href="/about">{t.philosophyLink}</Link></div></Reveal></section>
 <section className="homeServices sectionDark"><Reveal className="sectionTop"><div><p className="eyebrow">{t.capabilitiesEyebrow}</p><h2>{t.capabilitiesTitle1}<br/><span>{t.capabilitiesTitle2}</span></h2></div><p>{t.capabilitiesLead}</p></Reveal>
  <div className="serviceList">{serviceMeta.map(([n,href,img],i)=><Reveal key={n} delay={i*70}><Link href={href} className="serviceRow"><div className="serviceThumb" style={{backgroundImage:`url(${img})`}}/><span>{n}</span><div><h3>{t.services[i].t}</h3><p>{t.services[i].d}</p></div><b>↗</b></Link></Reveal>)}</div>
 </section>
 <section className="homeProjects sectionDark2"><Reveal className="sectionTop"><div><p className="eyebrow">{t.selectedWorkEyebrow}</p><h2>{t.selectedWorkTitle1}<br/><span>{t.selectedWorkTitle2}</span></h2></div><Link className="lineLink light" href="/projects">{t.openArchive}</Link></Reveal>
  <div className="projectGrid"><Reveal><ProjectCard href="/projects/pool-01" image="/projects/pool-01/06.webp" number={common[lang].poolTag} title={t.card1Title} meta={t.card1Meta} large/></Reveal><Reveal delay={100}><ProjectCard href="/projects/pool-02" image="/projects/pool-02/07.webp" number={common[lang].poolTag} title={t.card2Title} meta={t.card2Meta}/></Reveal><Reveal delay={200}><ProjectCard href="/projects/house-01" image="/projects/house-01/12.webp" number={common[lang].residentialTag} title={t.card3Title} meta={t.card3Meta}/></Reveal></div>
 </section>
 <section className="homeIntro calcTeaser sectionLight"><Reveal className="twoCol"><div><p className="eyebrow dark">{t.calcTeaserEyebrow}</p><h2>{t.calcTeaserTitle1}<br/><span>{t.calcTeaserTitle2}</span></h2></div><div className="copy"><p>{t.calcTeaserLead}</p><Link className="button gold" href="/calculator">{t.calcTeaserCta}</Link></div></Reveal></section>
 <section className="statement sectionLight"><Reveal><p className="eyebrow dark">{t.statementEyebrow}</p><h2>{t.statementTitle1}<br/><span>{t.statementTitle2}</span></h2><Link className="button darkButton" href="/contact">{t.statementCta}</Link></Reveal></section>
 </main>;
}
