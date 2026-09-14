'use client';
import Link from 'next/link';
import Reveal from './Reveal';
import type { Project } from '../content/siteContent';
import { useLanguage } from './LanguageContext';
import { common } from '../content/i18n';

export default function ProjectDetail({project}:{project:Project}){
  const { lang } = useLanguage();
  const c = project.content[lang];
  return <main className="projectDetail">
    <section className="projectHero" style={{backgroundImage:`url(${project.heroImage})`}}><div className="projectHeroShade"/><div className="projectHeroText"><p className="eyebrow">{c.eyebrow}</p><h1>{c.title}<br/><span>{c.titleSecond}</span></h1><p>{c.description}</p></div></section>
    <section className="projectFacts">{c.facts.map(f=><div key={f.label}><span>{f.label}</span><strong>{f.value}</strong></div>)}</section>
    <section className="sectionLight projectIntro"><Reveal className="twoCol"><div><p className="eyebrow dark">{c.introEyebrow}</p><h2>{c.introTitle}<br/><span>{c.introTitleSecond}</span></h2></div><div className="copy"><p>{c.introText}</p></div></Reveal></section>
    <section className={`gallerySection ${project.images.length===1?'singleGallery':''}`}><div className="gallery">{project.images.map((src,i)=><Reveal key={src} delay={i*30}><img src={src} alt={`GARON ${c.title} ${c.titleSecond} stage ${i+1}`} /></Reveal>)}</div></section>
    <section className="sectionLight pageCta"><Reveal><p className="eyebrow dark">{c.nextEyebrow}</p><h2>{c.nextTitle}<br/><span>{c.nextTitleSecond}</span></h2><Link className="button gold" href={project.nextHref}>{project.nextHref==='/contact'?common[lang].contactCta:common[lang].nextProjectCta}</Link></Reveal></section>
  </main>
}
