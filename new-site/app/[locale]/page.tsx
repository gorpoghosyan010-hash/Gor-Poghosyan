import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/content/dictionaries';
import { categoryOrder, getProject } from '@/content/projects';
import { serviceImages, serviceKeys } from '@/content/services';
import { isLocale, localizePath, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import Hero from '@/components/home/Hero';
import ProjectsRail, { type RailItem } from '@/components/home/ProjectsRail';
import ServicesIndex from '@/components/home/ServicesIndex';
import ProcessStrip from '@/components/home/ProcessStrip';
import ClosingCta from '@/components/home/ClosingCta';
import LineToPhoto from '@/components/ui/LineToPhoto';
import ScrubText from '@/components/ui/ScrubText';
import SplitReveal from '@/components/ui/SplitReveal';
import Reveal from '@/components/ui/Reveal';
import Counter from '@/components/ui/Counter';
import ArrowLink from '@/components/ui/ArrowLink';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { ...pageMetadata({ locale, path: '/', description: t.meta.description }), title: { absolute: t.meta.siteTitle } };
}

const featured = ['private-residence', 'mosaic-pool-spa', 'mountain-view-pool', 'apartment-transformation', 'villa-concept', 'residential-quarter'];

export default async function Home({ params }: Params) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = getDictionary(locale);

  const rail: RailItem[] = featured.map((slug) => {
    const p = getProject(slug)!;
    return {
      href: localizePath(locale, `/projects/${p.slug}`),
      image: p.cover,
      position: p.coverPosition,
      number: `0${categoryOrder.indexOf(p.category) + 1}`,
      category: t.categories[p.category],
      title: p.title[locale],
      location: p.location[locale],
      type: p.type[locale],
      summary: p.summary[locale],
      concept: p.concept ? t.common.conceptBadge : undefined
    };
  });

  return (
    <>
      <Hero subtitle={t.hero.subtitle} quote={t.hero.quote} caption={t.hero.caption} plate={t.hero.plate} scroll={t.common.scroll} />

      {/* Manifesto */}
      <section className="px-gutter py-28 md:py-44">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow">{t.manifesto.eyebrow}</p>
          </Reveal>
          <div className="lg:col-span-9">
            <ScrubText text={t.manifesto.text} className="display-lg max-w-5xl" />
            <Reveal>
              <p className="lead mt-10 max-w-xl">{t.hero.lead}</p>
            </Reveal>
          </div>
        </div>
        <div className="mt-24 grid grid-cols-1 border-t hairline sm:grid-cols-3 md:mt-32">
          {t.manifesto.stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.1}
              className="flex items-baseline gap-5 border-b hairline py-8 sm:flex-col sm:gap-2 sm:border-b-0 sm:border-r sm:py-10 sm:pl-6 sm:first:pl-0 sm:last:border-r-0"
            >
              <span className="font-display text-[clamp(64px,8vw,132px)] font-light leading-none">
                <Counter value={s.value} suffix={s.suffix} />
              </span>
              <span className="label">{s.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Signature: line → reality, on GARON's own house */}
      <LineToPhoto
        photo="/media/projects/house-01/11.webp"
        lines="/media/lines/house-lines.webp"
        alt={getProject('private-residence')!.title[locale]}
        stages={t.signature.stages}
        position="50% 30%"
        sizes="(min-width: 1024px) 40vw, 100vw"
        frameClassName="absolute inset-x-0 top-0 h-[58%] lg:inset-x-auto lg:right-(--gutter) lg:top-[13%] lg:h-[70%] lg:w-[38vw]"
      >
        <div className="px-gutter flex h-full flex-col justify-end pb-24 lg:w-[56%] lg:justify-center lg:pb-0">
          <p className="eyebrow mb-6">{t.signature.eyebrow}</p>
          <h2 className="display-xl">
            {t.signature.title1}
            <span className="serif-accent block">{t.signature.title2}</span>
          </h2>
          <p className="lead mt-8 max-w-md">{t.signature.lead}</p>
        </div>
      </LineToPhoto>

      {/* Projects rail */}
      <ProjectsRail
        items={rail}
        viewLabel={t.common.view}
        head={
          <>
            <p className="eyebrow mb-6">{t.rail.eyebrow}</p>
            <SplitReveal as="h2" className="display-lg" lines={[t.rail.title1, { text: t.rail.title2, className: 'serif-accent' }]} />
            <div className="mt-10">
              <ArrowLink href={localizePath(locale, '/projects')}>{t.rail.cta}</ArrowLink>
            </div>
          </>
        }
      />

      {/* Services index */}
      <section className="px-gutter py-28 md:py-40">
        <div className="mb-16 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-6">{t.servicesIndex.eyebrow}</p>
            <SplitReveal as="h2" className="display-lg" lines={[t.servicesIndex.title1, { text: t.servicesIndex.title2, className: 'serif-accent' }]} />
          </div>
          <Reveal className="flex items-end lg:col-span-4 lg:col-start-9">
            <p className="text-stone/70">{t.services.designBuild.text}</p>
          </Reveal>
        </div>
        <ServicesIndex
          items={serviceKeys.map((k) => ({
            title: t.services.items[k].title,
            kicker: t.services.items[k].kicker,
            image: serviceImages[k],
            href: localizePath(locale, `/services#${k}`)
          }))}
        />
        <div className="mt-12">
          <ArrowLink href={localizePath(locale, '/services')}>{t.servicesIndex.cta}</ArrowLink>
        </div>
      </section>

      {/* Process */}
      <section className="px-gutter border-t hairline py-28 md:py-40">
        <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-6">{t.processStrip.eyebrow}</p>
            <SplitReveal as="h2" className="display-lg" lines={[t.processStrip.title1, { text: t.processStrip.title2, className: 'serif-accent' }]} />
          </div>
          <ArrowLink href={localizePath(locale, '/process')}>{t.processStrip.cta}</ArrowLink>
        </div>
        <ProcessStrip steps={t.process.steps} />
      </section>

      <ClosingCta eyebrow={t.cta.eyebrow} title1={t.cta.title1} title2={t.cta.title2} button={t.cta.button} href={localizePath(locale, '/contact')} />
    </>
  );
}
