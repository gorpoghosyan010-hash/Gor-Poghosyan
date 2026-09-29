import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/content/dictionaries';
import { categoryOrder, projects, projectsByCategory } from '@/content/projects';
import { isLocale, localizePath, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import PageIntro from '@/components/ui/PageIntro';
import ProjectStory from '@/components/projects/ProjectStory';
import CategoryNav from '@/components/projects/CategoryNav';
import ClosingCta from '@/components/home/ClosingCta';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: '/projects', title: t.meta.pages.projects.title, description: t.meta.pages.projects.description, image: '/media/projects/house-01/12.webp' });
}

export default async function ProjectsPage({ params }: Params) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = getDictionary(locale);
  const total = String(projects.length).padStart(2, '0');

  return (
    <>
      <PageIntro eyebrow={t.projectsPage.eyebrow} title1={t.projectsPage.title1} title2={t.projectsPage.title2} lead={t.projectsPage.lead} />

      <CategoryNav
        label={t.nav.projects}
        items={categoryOrder.map((key, i) => ({
          id: key,
          number: `0${i + 1}`,
          title: t.categories[key],
          count: projectsByCategory(key).length
        }))}
      />

      {categoryOrder.map((key, ci) => {
        const list = projectsByCategory(key);
        return (
          <section key={key} id={key} aria-labelledby={`cat-${key}`} className="px-gutter scroll-mt-32 border-t hairline py-20 md:py-32">
            <div className="grid gap-12 lg:grid-cols-12">
              <header className="lg:col-span-3">
                <div className="lg:sticky lg:top-32">
                  <span className="block font-display text-[clamp(96px,12vw,200px)] font-light leading-[0.8] text-bronze/90">0{ci + 1}</span>
                  <h2 id={`cat-${key}`} className="display-md mt-6">
                    {t.categories[key]}
                  </h2>
                  <p className="label mt-4">
                    {String(list.length).padStart(2, '0')} · {t.nav.projects}
                  </p>
                </div>
              </header>
              <div className="flex flex-col gap-24 md:gap-36 lg:col-span-9">
                {list.map((p, i) => (
                  <ProjectStory
                    key={p.slug}
                    flip={i % 2 === 1}
                    item={{
                      href: localizePath(locale, `/projects/${p.slug}`),
                      index: String(projects.indexOf(p) + 1).padStart(2, '0'),
                      total,
                      image: p.cover,
                      position: p.coverPosition,
                      title: p.title[locale],
                      location: p.location[locale],
                      type: p.type[locale],
                      summary: p.summary[locale],
                      concept: p.concept ? t.common.conceptBadge : undefined,
                      cta: t.common.viewProject,
                      view: t.common.view
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <ClosingCta eyebrow={t.cta.eyebrow} title1={t.cta.title1} title2={t.cta.title2} button={t.cta.button} href={localizePath(locale, '/contact')} />
    </>
  );
}
