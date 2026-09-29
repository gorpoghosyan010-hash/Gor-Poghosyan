'use client';

import Image from 'next/image';
import { useRef, type ReactNode } from 'react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';

/**
 * Signature transition: a bronze line drawing (extracted from the photograph itself, so every
 * line lands on the real edge) sweeps in, then the built photograph rises from the ground up
 * underneath it and the lines dissolve.
 *
 * pin=true  → full-screen scene pinned while you scroll through it.
 * pin=false → inline frame scrubbed as it passes through the viewport.
 */
export default function LineToPhoto({
  photo,
  lines,
  alt,
  stages,
  pin = true,
  position = '50% 50%',
  className = '',
  sizes = '100vw',
  frameClassName = 'absolute inset-0',
  children
}: {
  photo: string;
  lines: string;
  alt: string;
  stages?: string[];
  pin?: boolean;
  position?: string;
  className?: string;
  sizes?: string;
  /** Where the image layers sit inside the scene (defaults to full bleed). */
  frameClassName?: string;
  children?: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const stageEls = q('[data-stage]');
        const setStage = (p: number) => {
          const active = p < 0.38 ? 0 : p < 0.72 ? 1 : 2;
          stageEls.forEach((el, i) => el.toggleAttribute('data-active', i <= active));
        };

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: pin
            ? { trigger: root.current, start: 'top top', end: '+=220%', scrub: 0.8, pin: true, onUpdate: (s) => setStage(s.progress) }
            : { trigger: root.current, start: 'top 80%', end: 'bottom 35%', scrub: 0.8, onUpdate: (s) => setStage(s.progress) }
        });

        tl.fromTo(q('[data-lines]'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 })
          .fromTo(q('[data-scan]'), { xPercent: 0, opacity: 1 }, { xPercent: 100, duration: 1 }, 0)
          .to(q('[data-scan]'), { opacity: 0, duration: 0.1 }, 1)
          .fromTo(q('[data-anno] path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.05 }, 0.1)
          .fromTo(q('[data-photo]'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1 }, 1.05)
          .fromTo(q('[data-photo] img'), { scale: 1.12 }, { scale: 1, duration: 1.6 }, 1.05)
          .to(q('[data-lines]'), { opacity: 0, duration: 0.7 }, 1.8)
          .to(q('[data-anno]'), { opacity: 0, duration: 0.5 }, 1.9)
          .to({}, { duration: 0.3 });
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(q('[data-lines], [data-anno], [data-scan]'), { opacity: 0 });
        gsap.set(q('[data-photo]'), { clipPath: 'none' });
        q('[data-stage]').forEach((el) => el.setAttribute('data-active', ''));
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className={`relative overflow-hidden bg-ink ${pin ? 'h-[100svh]' : ''} ${className}`}>
      <div aria-hidden className="grid-lines absolute inset-0 opacity-50" />

      <div className={`overflow-hidden ${frameClassName}`}>
      <div data-photo className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(100% 0% 0% 0%)' }}>
        <Image src={photo} alt={alt} fill sizes={sizes} className="object-cover" style={{ objectPosition: position }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/30" />
      </div>

      <div data-lines aria-hidden className="absolute inset-0" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
        <Image src={lines} alt="" fill sizes={sizes} className="object-cover" style={{ objectPosition: position }} />
      </div>

      <div aria-hidden data-scan className="pointer-events-none absolute inset-y-0 left-0 w-full">
        <div className="absolute inset-y-0 left-0 w-px bg-bronze shadow-[0_0_24px_4px_rgba(194,155,98,0.45)]" />
      </div>

      <svg data-anno aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full text-bronze/70" fill="none" stroke="currentColor" strokeWidth="0.12">
        <path pathLength={1} strokeDasharray="1" strokeDashoffset="1" d="M4 8 H96" />
        <path pathLength={1} strokeDasharray="1" strokeDashoffset="1" d="M4 6.5 V9.5 M96 6.5 V9.5 M38 6.5 V9.5 M66 6.5 V9.5" />
        <path pathLength={1} strokeDasharray="1" strokeDashoffset="1" d="M3 12 V88" />
        <path pathLength={1} strokeDasharray="1" strokeDashoffset="1" d="M1.5 12 H4.5 M1.5 88 H4.5 M1.5 50 H4.5" />
        <path pathLength={1} strokeDasharray="1" strokeDashoffset="1" d="M97 92 H99 V94 M1 92 H3 M1 92 V94" />
      </svg>

      </div>

      {stages && (
        <div className="px-gutter absolute inset-x-0 bottom-6 z-10 flex items-center gap-3 md:bottom-10">
          {stages.map((s, i) => (
            <div key={s} data-stage className="group flex items-center gap-3">
              {i > 0 && <span className="h-px w-8 bg-stone/20 transition-colors duration-500 group-data-[active]:bg-bronze md:w-16" />}
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dust transition-colors duration-500 group-data-[active]:text-stone md:text-[11px]">
                <span className="text-bronze">0{i + 1}</span> {s}
              </span>
            </div>
          ))}
        </div>
      )}

      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  );
}
