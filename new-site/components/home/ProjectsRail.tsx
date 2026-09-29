'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

export type RailItem = {
  href: string;
  image: string;
  position?: string;
  number: string;
  category: string;
  title: string;
  location: string;
  type: string;
  summary: string;
  concept?: string;
};

/**
 * Pinned horizontal gallery on large screens (vertical scroll drives a sideways track);
 * a native swipeable row with snap points on touch / small screens.
 */
export default function ProjectsRail({ items, viewLabel, head }: { items: RailItem[]; viewLabel: string; head: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => track.current!.scrollWidth - window.innerWidth;
        gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (s) => gsap.set(bar.current, { scaleX: s.progress })
          }
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-ink lg:h-[100svh]">
      <div
        ref={track}
        className="flex h-full snap-x snap-mandatory items-center gap-5 overflow-x-auto px-(--gutter) py-24 [scrollbar-width:none] lg:snap-none lg:gap-10 lg:overflow-visible lg:py-0 [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-[82vw] shrink-0 snap-start flex-col justify-center sm:w-[60vw] lg:w-[34vw] lg:pr-10">{head}</div>

        {items.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            data-cursor={viewLabel}
            className="group relative flex w-[82vw] shrink-0 snap-start flex-col gap-5 sm:w-[60vw] lg:h-[74svh] lg:w-auto lg:flex-row lg:items-end lg:gap-8"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-char lg:aspect-auto lg:h-full lg:w-[36vw]">
              <Image
                src={p.image}
                alt={p.title}
                fill
                sizes="(min-width: 1024px) 36vw, 82vw"
                className="object-cover transition-transform duration-[1.6s] ease-(--ease-expo) group-hover:scale-[1.06]"
                style={{ objectPosition: p.position ?? '50% 50%' }}
              />
              <div aria-hidden className="absolute inset-0 bg-ink/10 transition-colors duration-700 group-hover:bg-transparent" />
              {p.concept && (
                <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-sand">
                  {p.concept}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 lg:w-[18vw] lg:pb-2">
              <span className="relative block h-[1em] overflow-hidden font-display text-[clamp(56px,6vw,110px)] font-light leading-none text-bronze">
                <span className="block transition-transform duration-700 ease-(--ease-expo) group-hover:-translate-y-full">{p.number}</span>
                <span aria-hidden className="absolute inset-0 translate-y-full outline-text transition-transform duration-700 ease-(--ease-expo) group-hover:translate-y-0">
                  {p.number}
                </span>
              </span>
              <span className="label">{p.category}</span>
              <h3 className="display-md transition-transform duration-700 ease-(--ease-expo) group-hover:translate-x-2">{p.title}</h3>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-sand">
                {p.location} · {p.type}
              </p>
              <p className="max-w-xs text-sm text-stone/70">{p.summary}</p>
            </div>
          </Link>
        ))}
        <div aria-hidden className="w-[1px] shrink-0 lg:w-[6vw]" />
      </div>

      <div aria-hidden className="px-gutter absolute inset-x-0 bottom-8 hidden lg:block">
        <div className="h-px w-full bg-stone/10">
          <div ref={bar} className="h-px origin-left scale-x-0 bg-bronze" />
        </div>
      </div>
    </section>
  );
}
