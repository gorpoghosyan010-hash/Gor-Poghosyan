import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/content/dictionaries';
import { categoryOrder, getProject, nextProject, projects, type ChapterKey } from '@/content/projects';
import { isLocale, locales, localizePath, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import ProjectHero from '@/components/projects/ProjectHero';
import ProjectChapter from '@/components/projects/ProjectChapter';
import BeforeAfter from '@/components/projects/BeforeAfter';
import NextProject from '@/components/projects/NextProject';
import ScrollProgress from '@/components/ui/ScrollProgress';
import Reveal from '@/components/ui/Reveal';
import ScrubText from '@/components/ui/ScrubText';
import SplitReveal from '@/components/ui/SplitReveal';

type Params = { params: Promise<{ locale: string; slug: string }> };

const chapterOrder: ChapterKey[] = ['concept', 'architecture', 'materials', 'construction', 'interior', 'result'];

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getProject(slug);
  if (!isLocale(locale) || !p) return {};
  return pageMetadata({ locale, path: `/projects/${slug}`, title: p.title[locale], description: p.summary[locale], image: p.cover });
}

export default async function ProjectPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  const p = getProject(slug);
  if (!isLocale(raw) || !p) notFound();
  const locale: Locale = raw;
  const t = getDictionary(locale);
  const next = nextProject(slug);
  const catNumber = `0${categoryOrder.indexOf(p.category) + 1}`;
  const chapters = [...p.chapters].sort((a, b) => chapterOrder.indexOf(a.key) - chapterOrder.indexOf(b.key));
  const pad = (n: number) => String(n).padStart(2, '0');

  const facts = [
    { label: t.common.category, value: `${catNumber} — ${t.categories[p.category]}` },
    { label: t.common.location, value: p.location[locale] },
    { label: t.common.type, value: p.type[locale] }
  ];

  return (
    <>
      <ScrollProgress />
      <ProjectHero
        image={p.cover}
        position={p.coverPosition}
        title={p.title[locale]}
        category={t.categories[p.category]}
        number={`N° ${pad(projects.indexOf(p) + 1)}`}
        concept={p.concept ? t.common.conceptBadge : undefined}
        scroll={t.common.scroll}
      />

      <section className="px-gutter py-20 md:py-32">
        <dl className="grid border-y hairline sm:grid-cols-3">
          {facts.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.08} className="flex flex-col gap-2 border-b hairline py-6 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
              <dt className="label">{f.label}</dt>
              <dd className="text-lg">{f.value}</dd>
            </Reveal>
          ))}
        </dl>
        <div className="mt-20 grid gap-8 lg:grid-cols-12 md:mt-28">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow">{t.project.storyEyebrow}</p>
          </Reveal>
          <ScrubText text={p.summary[locale]} className="display-lg lg:col-span-9" />
        </div>
      </section>

      {p.beforeAfter && (
        <section className="px-gutter border-t hairline py-20 md:py-28">
          <p className="eyebrow mb-6">{t.project.beforeAfter.eyebrow}</p>
          <SplitReveal as="h2" className="display-lg mb-12" lines={[t.project.beforeAfter.title]} />
          <BeforeAfter video={p.beforeAfter.video} frames={p.beforeAfter.frames} labels={t.project.beforeAfter} />
        </section>
      )}

      {chapters.map((c, i) => (
        <ProjectChapter
          key={c.key}
          number={`${pad(i + 1)} / ${pad(chapters.length)}`}
          title={t.project.chapters[c.key]}
          text={c.text[locale]}
          images={c.images}
          lines={c.lines}
          focus={c.focus}
          alt={`${p.title[locale]} — ${t.project.chapters[c.key]}`}
          dragLabel={t.common.drag}
        />
      ))}

      <NextProject
        href={localizePath(locale, `/projects/${next.slug}`)}
        image={next.cover}
        position={next.coverPosition}
        label={t.project.nextProject}
        title={next.title[locale]}
        view={t.common.view}
      />
    </>
  );
}
