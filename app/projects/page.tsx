'use client';
import Link from 'next/link'; import Reveal from '../../components/Reveal'; import ProjectCard from '../../components/ProjectCard';
import { poolCardsByLang } from '../../content/siteContent';
import { useLanguage } from '../../components/LanguageContext';
import { projectsArchive, common } from '../../content/i18n';
export default function Projects(){
 const { lang } = useLanguage();
 const t = projectsArchive[lang];
 const poolCards = poolCardsByLang[lang];
 return <main className="innerPage"><section className="innerHero projectsHero"><div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title1}<br/><span>{t.title2}</span></h1><p>{t.lead}</p></div></section>
<section className="sectionLight archiveIntro"><Reveal className="twoCol"><div><p className="eyebrow dark">{t.poolsEyebrow}</p><h2>{t.poolsTitle1}<br/><span>{t.poolsTitle2}</span></h2></div><div className="copy"><p>{t.poolsText}</p></div></Reveal></section>
<section className="sectionDark projectArchive"><div className="archiveGrid poolArchive">{poolCards.map((p,i)=><Reveal key={p[0]} delay={i*50}><ProjectCard href={p[0]} number={p[1]} title={p[2]} meta={p[3]} image={p[4]} large={i===0}/></Reveal>)}</div></section>
<section className="sectionLight archiveIntro"><Reveal className="twoCol"><div><p className="eyebrow dark">{t.residentialEyebrow}</p><h2>{t.residentialTitle1}<br/><span>{t.residentialTitle2}</span></h2></div><div className="copy"><p>{t.residentialText}</p><Link className="lineLink" href="/projects/house-01">{t.openHouse}</Link></div></Reveal></section>
<section className="sectionDark projectArchive"><Reveal><div className="singleFeature"><ProjectCard href="/projects/house-01" image="/projects/house-01/12.webp" number={common[lang].residentialTag} title={t.houseCardTitle} meta={t.houseCardMeta} large/></div></Reveal></section>
<section className="sectionLight pageCta"><Reveal><p className="eyebrow dark">{t.nextEyebrow}</p><h2>{t.nextTitle1}<br/><span>{t.nextTitle2}</span></h2><Link className="button gold" href="/contact">{t.nextCta}</Link></Reveal></section></main>;
}
