'use client';

import type { RefObject } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

type Q = (selector: string) => Element[];

/**
 * Shared choreography for the service scenes.
 *  - Desktop: the whole scene is pinned and the timeline is scrubbed across ~2 screens of scroll.
 *  - Mobile/tablet: no pinning (text stays readable in normal flow); the media frame is scrubbed
 *    while it passes through the viewport.
 *  - Reduced motion: no timeline at all, `final` puts every layer in its end state.
 * Elements marked [data-stage] get [data-active] as the timeline advances.
 */
export function useScene(
  root: RefObject<HTMLElement | null>,
  build: (tl: gsap.core.Timeline, q: Q) => void,
  final: (q: Q) => void,
  length = '+=200%'
) {
  useGSAP(
    () => {
      const q = gsap.utils.selector(root) as Q;
      const stages = q('[data-stage]');
      const setStage = (p: number) => {
        const active = Math.min(stages.length - 1, Math.floor(p * stages.length * 0.999));
        stages.forEach((el, i) => el.toggleAttribute('data-active', i <= active));
      };

      const mm = gsap.matchMedia();
      mm.add(
        { desktop: '(min-width: 1024px)', motion: '(prefers-reduced-motion: no-preference)' },
        (ctx) => {
          const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
          if (!motion) {
            final(q);
            setStage(1);
            return;
          }
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: desktop
              ? { trigger: root.current, start: 'top top', end: length, pin: true, scrub: 0.8, onUpdate: (s) => setStage(s.progress) }
              : { trigger: q('[data-frame]')[0], start: 'top 85%', end: 'bottom 25%', scrub: 0.8, onUpdate: (s) => setStage(s.progress) }
          });
          build(tl, q);
          setStage(0);
        }
      );
      return () => mm.revert();
    },
    { scope: root }
  );
}
