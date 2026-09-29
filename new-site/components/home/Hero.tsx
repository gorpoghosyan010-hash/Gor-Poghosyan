'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import { introDelay } from '@/lib/intro';
import { site } from '@/content/site';

type Props = { subtitle: string; quote: string; caption: string; plate: string; scroll: string };

export default function Hero({ subtitle, quote, caption, plate, scroll }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const d = introDelay();
        gsap.fromTo(q('[data-media]'), { scale: 1.28 }, { scale: 1.06, duration: 2.8, delay: d - 0.3, ease: 'expo.out' });
        gsap.fromTo(q('[data-letter]'), { yPercent: 105 }, { yPercent: 0, duration: 1.6, stagger: 0.07, delay: d + 0.1 });
        gsap.fromTo(q('[data-fade]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.4, stagger: 0.12, delay: d + 0.6 });
        gsap.fromTo(q('[data-rule]'), { scaleX: 0 }, { scaleX: 1, duration: 1.8, delay: d + 0.4, ease: 'expo.inOut' });

        const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true };
        gsap.to(q('[data-media-wrap]'), { yPercent: 22, ease: 'none', scrollTrigger: st });
        gsap.fromTo(
          q('[data-frame]'),
          { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
          { clipPath: 'inset(7% 5% 0% 5% round 6px)', ease: 'none', scrollTrigger: { ...st, end: '60% top' } }
        );
        gsap.to(q('[data-word]'), { letterSpacing: '0.18em', yPercent: -40, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '70% top' } });
        gsap.to(q('[data-sub]'), { yPercent: -120, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '45% top' } });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative h-[100svh] min-h-[600px] overflow-hidden bg-ink" aria-label="GARON">
      <div data-frame className="absolute inset-0 overflow-hidden">
        <div data-media-wrap className="absolute inset-0">
          <div data-media className="absolute inset-0 scale-[1.06]">
            <Image
              src="/media/services/residential-hero.webp"
              alt={caption}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[55%_58%] max-md:object-[80%_62%]"
            />
          </div>
        </div>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,9,.55)_0%,rgba(11,10,9,.05)_30%,rgba(11,10,9,.15)_55%,rgba(11,10,9,.92)_100%)]" />
        <div aria-hidden className="grid-lines absolute inset-0 opacity-40" />
      </div>

      <div data-fade className="px-gutter absolute right-0 top-[calc(var(--header-h)+24px)] hidden md:block">
        <div className="glass flex flex-col gap-1 rounded-sm px-5 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-sand">
          <span className="text-bronze">N° 001 — {caption}</span>
          <span>{plate}</span>
          <span>{site.coordinates.label}</span>
        </div>
      </div>

      <div className="px-gutter absolute inset-x-0 bottom-0 pb-8 md:pb-12">
        <div data-sub className="mb-4 flex flex-col gap-4 md:mb-2 md:flex-row md:items-end md:justify-between">
          <p data-fade className="label text-stone/80">{subtitle}</p>
          <p data-fade className="serif-accent text-[clamp(22px,2.4vw,38px)] leading-tight">{quote}</p>
        </div>
        <div data-rule aria-hidden className="mb-2 h-px origin-left bg-stone/30" />
        <h1 aria-label={`GARON — ${subtitle}`} className="select-none">
          <span
            data-word
            aria-hidden
            className="flex justify-between font-display text-[clamp(84px,23.5vw,440px)] font-light leading-[0.8] tracking-[-0.02em] text-stone"
          >
            {'GARON'.split('').map((l, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.04em]">
                <span data-letter className="inline-block">
                  {l}
                </span>
              </span>
            ))}
          </span>
        </h1>
      </div>

      <div data-fade aria-hidden className="px-gutter absolute left-0 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
        <span className="relative block h-16 w-px overflow-hidden bg-stone/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_cubic-bezier(.65,0,.35,1)_infinite] bg-bronze" />
        </span>
        <span className="label [writing-mode:vertical-rl]">{scroll}</span>
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
