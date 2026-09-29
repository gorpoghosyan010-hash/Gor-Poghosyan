import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/content/dictionaries';
import { site, telHref } from '@/content/site';
import { isLocale, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import PageIntro from '@/components/ui/PageIntro';
import Reveal from '@/components/ui/Reveal';
import ContactForm from '@/components/contact/ContactForm';
import MapSection from '@/components/contact/MapSection';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: '/contact', title: t.meta.pages.contact.title, description: t.meta.pages.contact.description });
}

export default async function ContactPage({ params }: Params) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = getDictionary(locale);

  // Only channels that exist are shown; fill them in content/site.ts.
  const direct = [
    site.phone && { label: t.contact.call, value: site.phone, href: telHref(site.phone), external: false },
    { label: t.contact.email, value: site.email, href: `mailto:${site.email}`, external: false },
    site.instagram && { label: t.contact.instagram, value: site.instagram.replace(/^https?:\/\/(www\.)?/, ''), href: site.instagram, external: true },
    site.facebook && { label: t.contact.facebook, value: site.facebook.replace(/^https?:\/\/(www\.)?/, ''), href: site.facebook, external: true }
  ].filter(Boolean) as { label: string; value: string; href: string; external: boolean }[];

  return (
    <>
      <PageIntro eyebrow={t.contact.eyebrow} title1={t.contact.title1} title2={t.contact.title2} lead={t.contact.lead} />

      <section className="px-gutter pb-24 md:pb-36">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow mb-6">{t.contact.direct}</p>
            </Reveal>
            <ul className="border-t hairline">
              {direct.map((d, i) => (
                <Reveal as="li" key={d.label} delay={i * 0.08} className="border-b hairline">
                  <a
                    href={d.href}
                    {...(d.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-center justify-between gap-6 py-6"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="label">{d.label}</span>
                      <span className="text-xl transition-colors duration-500 group-hover:text-bronze-soft md:text-2xl">{d.value}</span>
                    </span>
                    <span
                      aria-hidden
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border hairline transition-all duration-500 group-hover:-rotate-45 group-hover:border-bronze group-hover:bg-bronze group-hover:text-ink"
                    >
                      →
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.2}>
              <p className="mt-10 max-w-sm text-stone/65">{t.contact.cardText}</p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="glass rounded-sm p-6 sm:p-10 lg:col-span-6 lg:col-start-7">
            <ContactForm t={t.contact.form} email={site.email} />
          </Reveal>
        </div>
      </section>

      <MapSection
        query={site.mapQuery}
        title={t.contact.map.mapTitle}
        eyebrow={t.contact.map.eyebrow}
        heading={t.contact.map.title}
        open={t.contact.map.open}
        coordinates={site.coordinates.label}
        address={t.common.yerevan}
      />
    </>
  );
}
