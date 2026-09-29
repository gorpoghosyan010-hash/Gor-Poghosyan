'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';

export default function ProjectHero({
  image,
  position,
  title,
  category,
  number,
  concept,
  scroll
}: {
  image: string;
  position?: string;
  title: string;
  category: string;
  number: string;
  concept?: string;
  scroll: string;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(q('[data-img]'), { scale: 1.25 }, { scale: 1.05, duration: 2.6, delay: 0.1 });
        gsap.fromTo(q('[data-word]'), { yPercent: 110 }, { yPercent: 0, duration: 1.4, stagger: 0.08, delay: 0.45 });
        gsap.fromTo(q('[data-fade]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, delay: 0.8 });
        const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true };
        gsap.to(q('[data-parallax]'), { yPercent: 20, ease: 'none', scrollTrigger: st });
        gsap.to(q('[data-title]'), { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '60% top' } });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative h-[100svh] min-h-[560px] overflow-hidden">
      <div data-parallax className="absolute inset-0">
        <div data-img className="absolute inset-0 scale-[1.05]">
          <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: position ?? '50% 50%' }} />
        </div>
      </div>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,9,.5)_0%,transparent_30%,transparent_50%,rgba(11,10,9,.9)_100%)]" />
      <div aria-hidden className="grid-lines absolute inset-0 opacity-30" />

      <div data-title className="px-gutter absolute inset-x-0 bottom-0 pb-10 md:pb-16">
        <div data-fade className="mb-6 flex flex-wrap items-center gap-4">
          <span className="font-mono text-[11px] tracking-[0.16em] text-bronze">{number}</span>
          <span className="label text-stone/80">{category}</span>
          {concept && <span className="glass rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-sand">{concept}</span>}
        </div>
        <h1 className="display-xl max-w-5xl">
          {title.split(' ').map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
              <span data-word className="inline-block">
                {w}
                {' '}
              </span>
            </span>
          ))}
        </h1>
        <div data-fade className="mt-8 flex items-center gap-3">
          <span className="label">{scroll}</span>
          <span aria-hidden className="h-px w-16 bg-stone/30" />
        </div>
      </div>
    </section>
  );
}
