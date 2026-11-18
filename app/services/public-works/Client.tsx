'use client';
import PageHero from '../../../components/PageHero';
import ServiceProjects from '../../../components/ServiceProjects';
import type { ProjectCardData } from '../../../content/projectTypes';
import Reveal from '../../../components/Reveal';
import { useLanguage } from '../../../components/LanguageContext';
import { serviceDetailShared, serviceDetailPages } from '../../../content/i18n';
export default function Client({ projects }: { projects: ProjectCardData[] }){
 const { lang } = useLanguage();
 const s = serviceDetailShared[lang];
 const p = serviceDetailPages['public-works'][lang];
 return <main className="innerPage"><PageHero image="/services/public-works-hero-poster.webp?v=2" media={{ video: '/services/public-works-hero.mp4?v=2', poster: '/services/public-works-hero-poster.webp?v=2', ratio: '16/9' }} eyebrow={s.eyebrow} title1={p.title} lead={p.lead}/><section className="sectionLight detailBody"><Reveal className="twoCol"><div><p className="eyebrow dark">{s.approachEyebrow}</p><h2>{p.approachTitle1}<br/><span>{p.approachTitle2}</span></h2></div><div className="copy"><p>{p.approachText1}</p><p>{p.approachText2}</p><p>{p.approachText3}</p><p>{p.approachText4}</p><p className="approachClosing">{p.approachText5}</p></div></Reveal></section><section className="sectionDark process"><Reveal><p className="eyebrow">{s.processEyebrow}</p><div className="processGrid">{p.steps.map((st,i)=><article key={st.t}><b>{String(i+1).padStart(2,'0')}</b><h3>{st.t}</h3><p>{st.d}</p></article>)}</div></Reveal></section><ServiceProjects kind="public" projects={projects}/></main>;
}
