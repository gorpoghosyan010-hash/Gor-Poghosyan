'use client';

import { useRef } from 'react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import StageIcon from './StageIcon';

/**
 * Six-stage timeline. A bronze line grows down the spine as you scroll; each stage lights up
 * (node fills, numeral turns bronze, its line-icon draws itself) when the line reaches it.
 */
export default function Timeline({ steps }: { steps: { t: string; d: string }[] }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          q('[data-spine]'),
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 60%', end: 'bottom 60%', scrub: 0.5 } }
        );
        q('[data-step]').forEach((step) => {
          const icon = step.querySelectorAll('[data-icon] path, [data-icon] circle, [data-icon] rect');
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: step,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
              onEnter: () => step.setAttribute('data-active', ''),
              onLeaveBack: () => step.removeAttribute('data-active')
            }
          });
          tl.fromTo(step.querySelectorAll('[data-rise]'), { opacity: 0.15, y: 30 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }).fromTo(
            icon,
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.4, stagger: 0.12, ease: 'power2.inOut' },
            0.1
          );
        });
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        q('[data-step]').forEach((s) => s.setAttribute('data-active', ''));
        gsap.set(q('[data-icon] path, [data-icon] circle, [data-icon] rect'), { strokeDashoffset: 0 });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <ol ref={root} className="relative">
      <span aria-hidden className="absolute bottom-0 left-[19px] top-0 w-px bg-stone/12 md:left-1/2">
        <span data-spine className="absolute inset-0 origin-top bg-bronze" />
      </span>
      {steps.map((s, i) => {
        const right = i % 2 === 1;
        return (
          <li key={s.t} data-step className="group relative grid grid-cols-[40px_1fr] gap-6 pb-24 md:grid-cols-2 md:gap-24 md:pb-40">
            <span
              aria-hidden
              className="relative z-10 mt-3 h-[9px] w-[9px] translate-x-[15px] rounded-full border border-stone/40 bg-ink transition-colors duration-700 group-data-[active]:border-bronze group-data-[active]:bg-bronze md:absolute md:left-1/2 md:mt-5 md:-translate-x-1/2"
            />
            <div className={`flex flex-col gap-5 md:row-start-1 ${right ? 'md:col-start-2' : 'md:col-start-1 md:items-end md:text-right'}`}>
              <span data-rise className="font-display text-[clamp(72px,9vw,150px)] font-light leading-[0.8] text-stone/20 transition-colors duration-700 group-data-[active]:text-bronze">
                0{i + 1}
              </span>
              <h2 data-rise className="display-md">
                {s.t}
              </h2>
              <p data-rise className="max-w-md text-stone/70">
                {s.d}
              </p>
            </div>
            <div className={`hidden md:row-start-1 md:flex md:items-center ${right ? 'md:col-start-1 md:justify-end' : 'md:col-start-2'}`}>
              <StageIcon index={i} className="h-40 w-40 text-bronze-soft/80 lg:h-52 lg:w-52" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
