'use client';
import Reveal from './Reveal';
import ProjectCard from './ProjectCard';
import { useLanguage } from './LanguageContext';
import { projectUi } from '../content/i18n';
import type { ProjectCardData } from '../content/projectTypes';

// Մեկ նախագիծ → մեծ քարտ, մի քանիսը → ցանց (առաջինը՝ լայն)
export default function ProjectGrid({ projects }: { projects: ProjectCardData[] }) {
  const { lang } = useLanguage();
  const u = projectUi[lang];
  const card = (p: ProjectCardData, large: boolean) =>
    <ProjectCard href={`/projects/${p.slug}`} image={p.heroImage} number={u.categories[p.category].tag} title={p.title[lang]} meta={p.meta[lang]} large={large} />;
  if (projects.length === 1) return <Reveal><div className="singleFeature">{card(projects[0], true)}</div></Reveal>;
  return <div className="archiveGrid poolArchive">{projects.map((p, i) => <Reveal key={p.slug} delay={i * 50}>{card(p, i === 0)}</Reveal>)}</div>;
}
