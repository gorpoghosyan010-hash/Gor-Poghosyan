'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type Labels = { before: string; construction: string; after: string; hint: string };

/**
 * BEFORE → CONSTRUCTION → AFTER.
 * Dragging the handle (or using the arrow keys / stage buttons) scrubs the renovation film,
 * so the transformation plays frame by frame under the viewer's hand. The three stills are
 * shown underneath as a fallback while the film loads (and for reduced motion).
 */
export default function BeforeAfter({ video, frames, labels }: { video: string; frames: [string, string, string]; labels: Labels }) {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [value, setValue] = useState(0); // 0..1
  const [ready, setReady] = useState(false);
  const target = useRef(0);
  const dragging = useRef(false);
  const stages = [labels.before, labels.construction, labels.after];
  const stops = [0, 0.5, 1];
  const stage = value < 0.25 ? 0 : value < 0.75 ? 1 : 2;

  // Ease the video towards the requested time for a smooth, weighted scrub.
  useEffect(() => {
    let raf = 0;
    let current = 0;
    const tick = () => {
      const v = vid.current;
      current += (target.current - current) * 0.14;
      if (v && ready && v.duration) {
        const t = current * (v.duration - 0.05);
        if (Math.abs(v.currentTime - t) > 0.01) v.currentTime = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  const set = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    target.current = clamped;
    setValue(clamped);
  }, []);

  const fromPointer = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    set((clientX - r.left) / r.width);
  };

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    const onReady = () => setReady(true);
    if (v.readyState >= 2) onReady();
    v.addEventListener('loadeddata', onReady);
    // iOS only paints seeked frames after the element has played once.
    v.play()
      .then(() => v.pause())
      .catch(() => {});
    return () => v.removeEventListener('loadeddata', onReady);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={box}
        data-cursor={labels.hint.split(' ')[0]}
        className="relative aspect-video w-full cursor-ew-resize touch-pan-y select-none overflow-hidden bg-char"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {frames.map((f, i) => (
          <Image
            key={f}
            src={f}
            alt={stages[i]}
            fill
            sizes="(min-width: 1024px) 80vw, 100vw"
            className={`object-cover transition-opacity duration-500 ${stage === i ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <video
          ref={vid}
          src={video}
          muted
          playsInline
          preload="auto"
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:hidden ${ready ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* handle */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0" style={{ left: `${value * 100}%` }}>
          <div className="absolute inset-y-0 -left-px w-px bg-bronze shadow-[0_0_20px_2px_rgba(194,155,98,0.5)]" />
          <div className="glass absolute top-1/2 left-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-stone">
            ‹ ›
          </div>
        </div>

        <div className="pointer-events-none absolute left-4 top-4 font-mono text-[11px] tracking-[0.16em] text-stone">
          <span className="glass rounded-full px-3 py-1.5">
            0{stage + 1} · {stages[stage]}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label={stages.join(' → ')} className="flex items-center gap-2">
          {stages.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => set(stops[i])}
              aria-pressed={stage === i}
              className={`rounded-full border px-4 py-2 text-sm transition-colors duration-500 ${
                stage === i ? 'border-bronze bg-bronze text-ink' : 'hairline text-sand hover:text-stone'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="flex flex-1 items-center gap-4 md:max-w-md">
          <span className="sr-only">{labels.hint}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(value * 100)}
            onChange={(e) => set(Number(e.target.value) / 100)}
            className="w-full accent-[var(--color-bronze)]"
          />
        </label>
        <span className="label hidden md:inline">{labels.hint}</span>
      </div>
    </div>
  );
}
