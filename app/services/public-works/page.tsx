'use client';
import Reveal from '../../../components/Reveal';
import { useLanguage } from '../../../components/LanguageContext';
import { serviceDetailShared, serviceDetailPages } from '../../../content/i18n';
import ScrollVideo from '../../../components/ScrollVideo';
export default function Page(){
 const { lang } = useLanguage();
 const s = serviceDetailShared[lang];
 const p = serviceDetailPages['public-works'][lang];
 return <main className="innerPage"><ScrollVideo src="/services/public-works-hero.mp4" poster="/services/public-works-hero-poster.webp" wide><div className="serviceDetailOverlay"/><div className="serviceDetailContent"><p className="eyebrow">{s.eyebrow}</p><h1>{p.title}</h1><p>{p.lead}</p></div></ScrollVideo><section className="sectionLight detailBody"><Reveal className="twoCol"><div><p className="eyebrow dark">{s.approachEyebrow}</p><h2>{p.approachTitle1}<br/><span>{p.approachTitle2}</span></h2></div><div className="copy"><p>{p.approachText1}</p><p>{p.approachText2}</p><p>{p.approachText3}</p><p>{p.approachText4}</p><p className="approachClosing">{p.approachText5}</p></div></Reveal></section><section className="sectionDark process"><Reveal><p className="eyebrow">{s.processEyebrow}</p><div className="processGrid">{p.steps.map((st,i)=><article key={st.t}><b>{String(i+1).padStart(2,'0')}</b><h3>{st.t}</h3><p>{st.d}</p></article>)}</div></Reveal></section></main>;
}
