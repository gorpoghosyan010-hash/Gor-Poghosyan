import SplitReveal from './SplitReveal';
import Reveal from './Reveal';

/** Standard page opening: ruled grid, eyebrow, oversized two-line title, short lead. */
export default function PageIntro({
  eyebrow,
  title1,
  title2,
  lead,
  aside
}: {
  eyebrow: string;
  title1: string;
  title2: string;
  lead?: string;
  aside?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pt-[calc(var(--header-h)+12vh)] pb-16 md:pb-24">
      <div aria-hidden className="grid-lines mask-fade-b absolute inset-0 opacity-60" />
      <div className="px-gutter relative">
        <Reveal>
          <p className="eyebrow mb-8">{eyebrow}</p>
        </Reveal>
        <SplitReveal as="h1" immediate delay={0.35} className="display-xl max-w-6xl" lines={[title1, { text: title2, className: 'serif-accent' }]} />
        {(lead || aside) && (
          <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12">
            {lead && (
              <Reveal delay={0.6} className="md:col-span-5 md:col-start-7">
                <p className="lead">{lead}</p>
              </Reveal>
            )}
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}
