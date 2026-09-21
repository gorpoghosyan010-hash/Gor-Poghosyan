'use client';
import Link from 'next/link';
import Reveal from './Reveal';
import ProjectCard from './ProjectCard';
import { useLanguage } from './LanguageContext';
import { poolCardsByLang } from '../content/siteContent';
import { common, home, projectsArchive, serviceProjects } from '../content/i18n';

export default function ServiceProjects({ kind }: { kind: 'pool' | 'residential' }) {
  const { lang } = useLanguage();
  const s = serviceProjects[lang][kind];
  const a = projectsArchive[lang];
  const h = home[lang];
  const poolCards = poolCardsByLang[lang];
  return (
    <section className="sectionDark projectArchive serviceProjects">
      <Reveal className="sectionTop">
        <div><p className="eyebrow">{h.selectedWorkEyebrow}</p><h2>{s.title1}<br/><span>{s.title2}</span></h2></div>
        <Link className="lineLink light" href="/projects">{h.openArchive}</Link>
      </Reveal>
      {kind === 'pool' ? (
        <div className="archiveGrid poolArchive">
          {poolCards.map((p, i) => (
            <Reveal key={p[0]} delay={i * 50}>
              <ProjectCard href={`/projects/${p[0]}`} number={p[1]} title={p[2]} meta={p[3]} image={p[4]} large={i === 0} />
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <div className="singleFeature">
            <ProjectCard href="/projects/house-01" image="/projects/house-01/12.webp" number={common[lang].residentialTag} title={a.houseCardTitle} meta={a.houseCardMeta} large />
          </div>
        </Reveal>
      )}
    </section>
  );
}
