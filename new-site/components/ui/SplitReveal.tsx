'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, type ElementType } from 'react';

type Line = string | { text: string; className?: string };

/** Headline that rises word by word out of a mask when it enters the viewport. */
export default function SplitReveal({
  as: Tag = 'h2',
  lines,
  className = '',
  delay = 0,
  stagger = 0.06,
  once = true,
  immediate = false
}: {
  as?: ElementType;
  lines: Line[];
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  /** Animate on mount instead of on scroll into view. */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: '0px 0px -12% 0px' });
  const show = immediate || inView;
  let index = 0;

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, li) => {
        const { text, className: lineClass = '' } = typeof line === 'string' ? { text: line } : line;
        const words = text.split(' ');
        return (
          <span key={li} className={`block ${lineClass}`}>
            {words.map((word, wi) => {
              const i = index++;
              return (
                <span key={wi} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: '110%' }}
                    animate={show ? { y: '0%' } : { y: '110%' }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: delay + i * stagger }}
                  >
                    {word}
                  </motion.span>
                  {wi < words.length - 1 && ' '}
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
