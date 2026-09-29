'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';

/**
 * Image that is unveiled with a clip-path wipe when it enters, then drifts
 * slightly slower than the page (parallax) while it stays in view.
 */
export default function ParallaxImage({
  src,
  alt,
  sizes = '100vw',
  className = '',
  imgClassName = '',
  position = '50% 50%',
  strength = 12,
  reveal = true,
  priority = false,
  cursor
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  position?: string;
  strength?: number;
  reveal?: boolean;
  priority?: boolean;
  cursor?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          inner.current,
          { yPercent: -strength / 2 },
          {
            yPercent: strength / 2,
            ease: 'none',
            scrollTrigger: { trigger: wrap.current, start: 'top bottom', end: 'bottom top', scrub: true }
          }
        );
        if (reveal) {
          gsap.fromTo(
            wrap.current,
            { clipPath: 'inset(12% 8% 12% 8%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.6,
              ease: 'expo.out',
              scrollTrigger: { trigger: wrap.current, start: 'top 88%', once: true }
            }
          );
        }
      });
      return () => mm.revert();
    },
    { scope: wrap }
  );

  return (
    <div ref={wrap} className={`relative overflow-hidden bg-char ${className}`} data-cursor={cursor}>
      <div ref={inner} className="absolute -inset-y-[8%] inset-x-0">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${imgClassName}`} style={{ objectPosition: position }} />
      </div>
    </div>
  );
}
