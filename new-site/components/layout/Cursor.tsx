'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A quiet cursor companion: invisible until the pointer is over an element with
 * `data-cursor="Label"`, where it grows into a bronze disc carrying the label.
 * Only on fine pointers; the native cursor is never hidden.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setEnabled(mq.matches);
    const onChange = () => setEnabled(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current!;
    let x = -100,
      y = -100,
      cx = x,
      cy = y,
      raf = 0;
    // The follow loop only runs while the disc is catching up with the pointer.
    const tick = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
      setLabel(target?.dataset.cursor ?? '');
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => setLabel('');
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90]">
      <div
        className={`-translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-bronze text-ink transition-[width,height,opacity] duration-500 ease-(--ease-expo) ${
          label ? 'h-24 w-24 opacity-100' : 'h-2 w-2 opacity-0'
        }`}
      >
        <span className={`font-mono text-[10px] uppercase tracking-[0.18em] transition-opacity duration-300 ${label ? 'opacity-100' : 'opacity-0'}`}>
          {label}
        </span>
      </div>
    </div>
  );
}
