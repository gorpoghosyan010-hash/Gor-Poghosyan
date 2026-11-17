'use client';
import PageHero from '../../../components/PageHero';
import type { ProjectCardData } from '../../../content/projectTypes';
import Reveal from '../../../components/Reveal';
import { useLanguage } from '../../../components/LanguageContext';
import { serviceDetailShared, serviceDetailPages } from '../../../content/i18n';
import ServiceCalculator from '../../../components/ServiceCalculator';
import ServiceProjects from '../../../components/ServiceProjects';
export default function Client({ projects }: { projects: ProjectCardData[] }){
 const { lang } = useLanguage();
 const s = serviceDetailShared[lang];
 const p = serviceDetailPages.pools[lang];
 return <main className="innerPage"><PageHero image="/projects/pool-01/06.webp" eyebrow={s.eyebrow} title1={p.title} lead={p.lead}/><section className="sectionLight detailBody"><Reveal className="twoCol"><div><p className="eyebrow dark">{s.approachEyebrow}</p><h2>{p.approachTitle1}<br/><span>{p.approachTitle2}</span></h2></div><div className="copy"><p>{p.approachText1}</p><p>{p.approachText2}</p><p className="approachClosing">{p.approachText3}</p></div></Reveal></section><section className="sectionDark process"><Reveal><p className="eyebrow">{s.processEyebrow}</p><div className="processGrid">{p.steps.map((st,i)=><article key={st.t}><b>{String(i+1).padStart(2,'0')}</b><h3>{st.t}</h3><p>{st.d}</p></article>)}</div></Reveal></section><ServiceCalculator kind="pool" modes={['pool']}/><ServiceProjects kind="pool" projects={projects}/></main>;
}
