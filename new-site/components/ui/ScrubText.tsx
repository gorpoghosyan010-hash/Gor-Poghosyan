'use client';

import { useRef } from 'react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';

/** Paragraph whose words light up one by one as it scrolls through the viewport. */
export default function ScrubText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ref.current!.querySelectorAll('[data-w]'),
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 }
          }
        );
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <p ref={ref} className={className}>
      {text.split(' ').map((w, i) => (
        <span key={i} data-w className="inline">
          {w}{' '}
        </span>
      ))}
    </p>
  );
}
