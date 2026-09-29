import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/content/dictionaries';
import { constructionStages, poolStages, serviceKeys, type ServiceKey } from '@/content/services';
import { isLocale, localizePath, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import PageIntro from '@/components/ui/PageIntro';
import Reveal from '@/components/ui/Reveal';
import SplitReveal from '@/components/ui/SplitReveal';
import ClosingCta from '@/components/home/ClosingCta';
import { ArchitectureScene, EngineeringScene, RenovationScene, SequenceScene } from '@/components/services/Scenes';
import type { SceneCopy } from '@/components/services/SceneLayout';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: '/services', title: t.meta.pages.services.title, description: t.meta.pages.services.description, image: '/media/services/residential-hero.webp' });
}

export default async function ServicesPage({ params }: Params) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = getDictionary(locale);

  const copy = (key: ServiceKey): SceneCopy => {
    const s = t.services.items[key];
    return { id: key, number: `0${serviceKeys.indexOf(key) + 1}`, title: s.title, kicker: s.kicker, text: s.text, points: s.points, stages: s.stages };
  };

  return (
    <>
      <PageIntro
        eyebrow={t.services.eyebrow}
        title1={t.services.title1}
        title2={t.services.title2}
        lead={t.services.lead}
        aside={
          <nav aria-label={t.nav.services} className="md:col-span-5 md:col-start-1 md:row-start-1">
            <ul className="flex flex-col border-t hairline">
              {serviceKeys.map((k, i) => (
                <li key={k} className="border-b hairline">
                  <a href={`#${k}`} className="group flex items-baseline gap-4 py-3 text-stone/80 transition-colors hover:text-stone">
                    <span className="font-mono text-[11px] text-bronze">0{i + 1}</span>
                    <span className="transition-transform duration-500 group-hover:translate-x-2">{t.services.items[k].title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        }
      />

      <ArchitectureScene copy={copy('architecture')} alt={t.services.items.architecture.title} />
      <EngineeringScene copy={copy('engineering')} alt={t.services.items.engineering.title} />
      <SequenceScene copy={copy('construction')} images={constructionStages} alt={t.services.items.construction.title} />
      <RenovationScene copy={copy('renovation')} alt={t.services.items.renovation.title} />
      <SequenceScene copy={copy('pools')} images={poolStages} alt={t.services.items.pools.title} flip />

      <section className="px-gutter border-t hairline py-28 md:py-40">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow">GARON / Design &amp; Build</p>
          </Reveal>
          <div className="lg:col-span-8">
            <SplitReveal as="h2" className="display-xl" lines={[{ text: t.services.designBuild.title, className: '' }]} />
            <Reveal delay={0.2}>
              <p className="lead mt-10 max-w-2xl">{t.services.designBuild.text}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <ClosingCta eyebrow={t.cta.eyebrow} title1={t.cta.title1} title2={t.cta.title2} button={t.cta.button} href={localizePath(locale, '/contact')} />
    </>
  );
}
