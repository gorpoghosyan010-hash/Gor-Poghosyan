'use client';
import { useEffect, useRef } from 'react';

// Նկարը լրիվ բարձրությամբ է և ձախից աջ է սահում թերթելիս (--pan՝ 0-ից 1), ինչպես նաև ձեռքով քաշելիս։
// Հեռախոսի լայնության վրա՝ բոլոր նկարների համար, panorama-ի դեպքում՝ ամեն լայնության վրա։
export default function HeroImage({ src, panorama = false }: { src: string; panorama?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const hero = el?.parentElement;
    if (!el || !hero) return;
    const mobile = window.matchMedia('(max-width:850px)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const active = () => panorama || mobile.matches;
    let aspect = 0;
    let manual = reduceMotion.matches ? 0.5 : 0;
    let dragging = false;
    let startX = 0;
    let startManual = 0;
    let frame = 0;

    const image = new Image();
    image.onload = () => { aspect = image.naturalWidth / image.naturalHeight; };
    image.src = src;

    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const render = () => {
      frame = 0;
      hero.classList.toggle('draggable', active());
      if (!active()) { el.style.removeProperty('--pan'); return; }
      const scrolled = reduceMotion.matches ? 0 : clamp(window.scrollY / ((el.offsetHeight || 1) * 0.4));
      el.style.setProperty('--pan', clamp(manual + scrolled).toFixed(3));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const range = () => Math.max(0, el.offsetHeight * aspect - el.offsetWidth);

    const onDown = (e: PointerEvent) => {
      if (!active() || !aspect || (e.pointerType === 'mouse' && e.button !== 0)) return;
      dragging = true;
      startX = e.clientX;
      startManual = manual;
      hero.classList.add('dragging');
      try { hero.setPointerCapture(e.pointerId); } catch {}
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || !range()) return;
      manual = clamp(startManual - (e.clientX - startX) / range());
      schedule();
    };
    const onUp = () => { dragging = false; hero.classList.remove('dragging'); };

    render();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    hero.addEventListener('pointerdown', onDown);
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerup', onUp);
    hero.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      hero.removeEventListener('pointerdown', onDown);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerup', onUp);
      hero.removeEventListener('pointercancel', onUp);
      hero.classList.remove('draggable', 'dragging');
      if (frame) cancelAnimationFrame(frame);
    };
  }, [src, panorama]);
  return <div ref={ref} className={`serviceDetailImage ${panorama ? 'panAlways' : 'panImage'}`} style={{ backgroundImage: `url(${src})` }} />;
}
