'use client';

import { useEffect, useState } from 'react';
import VillaElevation from '@/components/drawings/VillaElevation';

/**
 * First-visit intro. The animation is pure CSS so it plays before hydration;
 * an inline script in the layout hides it for the rest of the session.
 */
export default function Loader({ line }: { line: string }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (html.hasAttribute('data-seen')) {
      setGone(true);
      return;
    }
    const done = () => {
      try {
        sessionStorage.setItem('garon-intro', '1');
      } catch {}
      html.setAttribute('data-seen', '');
      setGone(true);
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(done, reduce ? 0 : 2900);
    return () => window.clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <div className="loader fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink text-bronze-soft" aria-hidden>
      <div aria-hidden className="grid-lines absolute inset-0 opacity-40" />
      <VillaElevation className="relative w-[min(78vw,520px)]" strokeWidth={1.2} />
      <div className="relative mt-10 flex flex-col items-center gap-3">
        <span className="loader-word font-display text-[clamp(40px,7vw,72px)] font-light tracking-[0.34em] text-stone">GARON</span>
        <span className="loader-line label">{line}</span>
      </div>
      <span className="loader-count absolute bottom-8 right-(--gutter) font-mono text-[11px] tracking-[0.2em] text-sand" />
      <span className="absolute bottom-8 left-(--gutter) font-mono text-[11px] tracking-[0.2em] text-sand">40°10′N 44°29′E</span>
      <style>{`
        @property --pct { syntax: '<integer>'; inherits: false; initial-value: 0; }
        .loader { animation: loader-lift 1s cubic-bezier(.76,0,.24,1) 2.05s forwards; }
        .loader .draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: loader-draw 1.1s cubic-bezier(.65,0,.35,1) forwards; }
        .loader .draw-1 { animation-delay: .05s } .loader .draw-2 { animation-delay: .1s } .loader .draw-3 { animation-delay: .2s }
        .loader .draw-4 { animation-delay: .32s } .loader .draw-5 { animation-delay: .44s } .loader .draw-6 { animation-delay: .52s }
        .loader .draw-7 { animation-delay: .7s } .loader .draw-8 { animation-delay: .82s } .loader .draw-9 { animation-delay: .9s }
        .loader-word { opacity: 0; animation: loader-word 1.4s cubic-bezier(.16,1,.3,1) .6s forwards; }
        .loader-line { opacity: 0; animation: loader-fade 1s ease .95s forwards; }
        .loader-count { counter-reset: pct var(--pct); animation: loader-count 1.9s cubic-bezier(.65,0,.35,1) forwards; }
        .loader-count::after { content: counter(pct, decimal-leading-zero) ' %'; }
        @keyframes loader-draw { to { stroke-dashoffset: 0 } }
        @keyframes loader-word { from { opacity: 0; letter-spacing: .7em } to { opacity: 1; letter-spacing: .34em } }
        @keyframes loader-fade { to { opacity: 1 } }
        @keyframes loader-count { to { --pct: 100 } }
        @keyframes loader-lift { to { transform: translateY(-100%) } }
        @media (prefers-reduced-motion: reduce) { .loader { display: none } }
      `}</style>
    </div>
  );
}
