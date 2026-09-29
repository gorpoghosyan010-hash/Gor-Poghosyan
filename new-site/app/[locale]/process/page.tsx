import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/content/dictionaries';
import { isLocale, localizePath, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import PageIntro from '@/components/ui/PageIntro';
import Timeline from '@/components/process/Timeline';
import ClosingCta from '@/components/home/ClosingCta';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: '/process', title: t.meta.pages.process.title, description: t.meta.pages.process.description });
}

export default async function ProcessPage({ params }: Params) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = getDictionary(locale);

  return (
    <>
      <PageIntro eyebrow={t.process.eyebrow} title1={t.process.title1} title2={t.process.title2} lead={t.process.lead} />
      <section className="px-gutter pt-12 pb-16 md:pt-24">
        <Timeline steps={t.process.steps} />
      </section>
      <ClosingCta eyebrow={t.cta.eyebrow} title1={t.cta.title1} title2={t.cta.title2} button={t.cta.button} href={localizePath(locale, '/contact')} />
    </>
  );
}
