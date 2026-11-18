'use client';
import Link from 'next/link';
import Reveal from './Reveal';
import ProjectGrid from './ProjectGrid';
import { useLanguage } from './LanguageContext';
import { home, serviceProjects } from '../content/i18n';
import type { ProjectCardData } from '../content/projectTypes';

// Ծառայության էջի «Մեր կառուցած ...» բաժինը. նախագիծ չկա → բաժինը չի ցուցադրվում
export default function ServiceProjects({ kind, projects }: { kind: keyof (typeof serviceProjects)['hy']; projects: ProjectCardData[] }) {
  const { lang } = useLanguage();
  if (!projects.length) return null;
  const s = serviceProjects[lang][kind];
  const h = home[lang];
  return (
    <section className="sectionDark projectArchive serviceProjects">
      <Reveal className="sectionTop">
        <div><p className="eyebrow">{h.selectedWorkEyebrow}</p><h2>{s.title1}<br/><span>{s.title2}</span></h2></div>
        <Link className="lineLink light" href="/projects">{h.openArchive}</Link>
      </Reveal>
      <ProjectGrid projects={projects} />
    </section>
  );
}
