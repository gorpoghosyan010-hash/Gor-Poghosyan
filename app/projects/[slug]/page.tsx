import { notFound } from 'next/navigation';
import ProjectDetail from '../../../components/ProjectDetail';
import { getNextLink, getProject, getProjects } from '../../../content/projects';
import { metaFor, pageMeta } from '../../../content/seo';

// Ամեն content/projects/<slug>.json ֆայլից build-ի ժամանակ ստեղծվում է ստատիկ էջ /projects/<slug>
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getProject(params.slug);
  if (!p) return {};
  const fallback = pageMeta[p.category === 'pools' ? '/projects/pool' : '/projects/house'].hy.description;
  return metaFor(`/projects/${p.slug}`, {
    title: p.subtitle ? `${p.title.hy} — ${p.subtitle.hy}` : p.title.hy,
    description: p.summary?.hy ?? fallback,
    image: p.heroImage
  });
}

export default function Page({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();
  return <ProjectDetail project={project} next={getNextLink(project.slug)} />;
}
