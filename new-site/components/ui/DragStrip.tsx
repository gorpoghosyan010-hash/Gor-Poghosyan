'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion } from 'framer-motion';

/** Horizontal image strip: swipe on touch, drag with the mouse, scroll-snaps to each frame. */
export default function DragStrip({ images, alt, label }: { images: string[]; alt: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, x: 0, left: 0, moved: false });

  return (
    <div className="relative">
      <div
        ref={ref}
        data-cursor={label}
        tabIndex={0}
        role="region"
        aria-label={alt}
        className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-6 [scrollbar-width:thin] active:cursor-grabbing"
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') return;
          drag.current = { active: true, x: e.clientX, left: ref.current!.scrollLeft, moved: false };
          ref.current!.style.scrollSnapType = 'none';
        }}
        onPointerMove={(e) => {
          if (!drag.current.active) return;
          const dx = e.clientX - drag.current.x;
          if (Math.abs(dx) > 3) drag.current.moved = true;
          ref.current!.scrollLeft = drag.current.left - dx;
        }}
        onPointerUp={() => {
          drag.current.active = false;
          ref.current!.style.scrollSnapType = '';
        }}
        onPointerLeave={() => {
          drag.current.active = false;
          if (ref.current) ref.current.style.scrollSnapType = '';
        }}
      >
        {images.map((src, i) => (
          <motion.figure
            key={src}
            className="relative aspect-[4/5] w-[72%] shrink-0 snap-start overflow-hidden bg-char md:w-[44%]"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 3) * 0.08 }}
          >
            <Image src={src} alt={`${alt} — ${i + 1}`} fill draggable={false} sizes="(min-width: 768px) 30vw, 72vw" className="object-cover" />
            <figcaption className="absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.16em] text-stone/90">
              {String(i + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  );
}
