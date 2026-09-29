'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (node.textContent = String(Math.round(v)))
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span>
      <span ref={ref}>{value}</span>
      <span className="text-bronze">{suffix}</span>
    </span>
  );
}
