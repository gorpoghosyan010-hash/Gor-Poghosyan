'use client';
import Link from 'next/link';
import Reveal from './Reveal';
import ProjectGrid from './ProjectGrid';
import { useLanguage } from './LanguageContext';
import { projectsArchive, projectUi } from '../content/i18n';
import { CATEGORIES, type ProjectCardData } from '../content/projectTypes';

// Բաժինները (Լողավազաններ, Տներ, Վերանորոգում, Հասարակական) ցուցադրվում են միայն եթե ունեն գոնե մեկ նախագիծ
export default function ProjectsArchive({ projects }: { projects: ProjectCardData[] }) {
  const { lang } = useLanguage();
  const t = projectsArchive[lang];
  const u = projectUi[lang];
  const sections = CATEGORIES.map(c => ({ c, items: projects.filter(p => p.category === c) })).filter(s => s.items.length);
  return <main className="innerPage">
    <section className="innerHero projectsHero" style={{ backgroundImage: "url('/projects/pool-01/06.webp')" }}><div className="innerHeroShade" /><div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title1}<br /><span>{t.title2}</span></h1><p>{t.lead}</p></div></section>
    {sections.map(({ c, items }, i) => {
      const s = u.categories[c];
      return <div key={c} id={c}>
        <section className="sectionLight archiveIntro"><Reveal className="twoCol"><div><p className="eyebrow dark">{String(i + 1).padStart(2, '0')} / {s.eyebrow}</p><h2>{s.title1}<br /><span>{s.title2}</span></h2></div><div className="copy"><p>{s.text}</p></div></Reveal></section>
        <section className="sectionDark projectArchive"><ProjectGrid projects={items} /></section>
      </div>;
    })}
    <section className="sectionLight pageCta"><Reveal><p className="eyebrow dark">{t.nextEyebrow}</p><h2>{t.nextTitle1}<br /><span>{t.nextTitle2}</span></h2><Link className="button gold" href="/contact">{t.nextCta}</Link></Reveal></section>
  </main>;
}
