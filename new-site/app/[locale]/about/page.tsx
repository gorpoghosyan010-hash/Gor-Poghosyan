import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/content/dictionaries';
import { site } from '@/content/site';
import { isLocale, localizePath, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import PageIntro from '@/components/ui/PageIntro';
import ParallaxImage from '@/components/ui/ParallaxImage';
import Reveal from '@/components/ui/Reveal';
import ScrubText from '@/components/ui/ScrubText';
import Counter from '@/components/ui/Counter';
import ArrowLink from '@/components/ui/ArrowLink';
import ClosingCta from '@/components/home/ClosingCta';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: '/about', title: t.meta.pages.about.title, description: t.meta.pages.about.description, image: '/media/projects/pool-01/06.webp' });
}

export default async function AboutPage({ params }: Params) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = getDictionary(locale);

  return (
    <>
      <PageIntro eyebrow={t.about.eyebrow} title1={t.about.title1} title2={t.about.title2} />

      <section className="px-gutter pb-24 md:pb-36">
        <div className="grid gap-6 md:grid-cols-12">
          <ParallaxImage
            src="/media/projects/pool-01/06.webp"
            alt={t.categories.pools}
            className="aspect-[4/5] md:col-span-5"
            sizes="(min-width: 768px) 40vw, 100vw"
          />
          <div className="flex flex-col justify-between gap-12 md:col-span-6 md:col-start-7">
            <div>
              <Reveal>
                <p className="flex items-baseline gap-4">
                  <span className="label">{t.about.since}</span>
                  <span className="font-display text-[clamp(72px,10vw,160px)] font-light leading-none text-bronze">{site.founded}</span>
                </p>
              </Reveal>
              <ScrubText text={t.about.lead} className="display-md mt-10" />
            </div>
            <ParallaxImage src="/media/projects/house-01/12.webp" alt={t.categories.houses} className="aspect-[16/11]" position="50% 45%" sizes="(min-width: 768px) 45vw, 100vw" />
          </div>
        </div>

        <div className="mt-24 grid gap-10 md:mt-36 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="lead">{t.about.text1}</p>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-5 md:col-start-8">
            <p className="text-stone/70">{t.about.text2}</p>
          </Reveal>
        </div>
      </section>

      <section className="px-gutter border-t hairline py-24 md:py-32">
        <p className="eyebrow mb-14">{t.about.valuesEyebrow}</p>
        <ol className="grid border-t hairline sm:grid-cols-2 lg:grid-cols-4">
          {t.about.values.map((v, i) => (
            <Reveal as="li" key={v.t} delay={i * 0.1} className="flex flex-col gap-5 border-b hairline py-10 sm:border-r sm:pr-8 sm:[&:nth-child(2n)]:border-r-0 lg:border-b-0 lg:pl-8 lg:first:pl-0 lg:[&:nth-child(2n)]:border-r lg:last:border-r-0">
              <span className="font-display text-5xl font-light text-bronze-soft">0{i + 1}</span>
              <h3 className="text-xl tracking-[0.02em]">{v.t}</h3>
              <p className="text-sm text-stone/65">{v.d}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-24 grid grid-cols-1 gap-y-10 sm:grid-cols-3">
          {t.manifesto.stats.map((s) => (
            <Reveal key={s.label} className="flex flex-col gap-2">
              <span className="font-display text-[clamp(56px,6vw,96px)] font-light leading-none">
                <Counter value={s.value} suffix={s.suffix} />
              </span>
              <span className="label">{s.label}</span>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 flex flex-wrap gap-8">
          <ArrowLink href={localizePath(locale, '/projects')}>{t.common.allProjects}</ArrowLink>
          <ArrowLink href={localizePath(locale, '/process')}>{t.processStrip.cta}</ArrowLink>
        </div>
      </section>

      <ClosingCta eyebrow={t.cta.eyebrow} title1={t.cta.title1} title2={t.cta.title2} button={t.cta.button} href={localizePath(locale, '/contact')} />
    </>
  );
}
