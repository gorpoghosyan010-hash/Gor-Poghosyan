'use client';
import Link from 'next/link'; import Reveal from '../../../components/Reveal';
import { useLanguage } from '../../../components/LanguageContext';
import { serviceDetailShared, serviceDetailPages } from '../../../content/i18n';
export default function Page(){
 const { lang } = useLanguage();
 const s = serviceDetailShared[lang];
 const p = serviceDetailPages.renovation[lang];
 return <main className="innerPage"><section className="serviceDetailHero"><div className="serviceDetailImage" style={{backgroundImage:'url(/projects/house-01/04.jpeg)'}}/><div className="serviceDetailOverlay"/><div className="serviceDetailContent"><p className="eyebrow">{s.eyebrow}</p><h1>{p.title}</h1><p>{p.lead}</p></div></section><section className="sectionLight detailBody"><Reveal className="twoCol"><div><p className="eyebrow dark">{s.approachEyebrow}</p><h2>{s.approachTitle1}<br/><span>{s.approachTitle2}</span></h2></div><div className="copy"><p>{s.approachText1}</p><p>{s.approachText2}</p></div></Reveal></section><section className="sectionDark process"><Reveal><p className="eyebrow">{s.processEyebrow}</p><div className="processGrid">{s.steps.map((st,i)=><article key={st.t}><b>{String(i+1).padStart(2,'0')}</b><h3>{st.t}</h3><p>{st.d}</p></article>)}</div></Reveal></section><section className="sectionLight pageCta"><Reveal><p className="eyebrow dark">{s.ctaEyebrow}</p><h2>{s.ctaTitle1}<br/><span>{s.ctaTitle2}</span></h2><Link className="button gold" href="/projects">{s.ctaButton}</Link></Reveal></section></main>;
}
