import Image from 'next/image';
import Link from 'next/link';
import SplitReveal from '@/components/ui/SplitReveal';
import Reveal from '@/components/ui/Reveal';

export default function ClosingCta({
  eyebrow,
  title1,
  title2,
  button,
  href
}: {
  eyebrow: string;
  title1: string;
  title2: string;
  button: string;
  href: string;
}) {
  return (
    <section className="relative overflow-hidden border-t hairline py-32 md:py-48">
      <div aria-hidden className="mask-fade-b absolute inset-0 opacity-35">
        <Image src="/media/lines/city-lines.webp" alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-ink)_75%)]" />
      <div className="px-gutter relative flex flex-col items-center text-center">
        <Reveal>
          <p className="eyebrow mb-8">{eyebrow}</p>
        </Reveal>
        <SplitReveal as="h2" className="display-xl max-w-5xl" lines={[title1, { text: title2, className: 'serif-accent' }]} />
        <Reveal delay={0.3} className="mt-14">
          <Link href={href} className="btn-round btn-solid group">
            {button}
            <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
