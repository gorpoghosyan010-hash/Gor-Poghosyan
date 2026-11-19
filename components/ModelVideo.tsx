'use client';
import { useEffect, useRef } from 'react';

// Ծրագրով նկարված անիմացիա (հատակագիծ → մակետ). հեռախոսի և համակարգչի համար առանձին կադրավորում։
// Սկսվում է ներածական էկրանը փակվելուց հետո, որ սկիզբը տեսանելի լինի։
export default function ModelVideo({ base, className }: { base: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const kind = window.matchMedia('(max-width: 850px)').matches ? 'mobile' : 'desktop';
    v.poster = `${base}-${kind}.webp`;
    v.src = `${base}-${kind}.mp4`;
    const start = () => { v.currentTime = 0; v.play().catch(() => {}); };
    if ((window as unknown as { __garonSplashDone?: boolean }).__garonSplashDone || !document.querySelector('.splash')) { start(); return; }
    window.addEventListener('garon:splash-done', start, { once: true });
    return () => window.removeEventListener('garon:splash-done', start);
  }, [base]);
  return <video ref={ref} className={className} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />;
}
