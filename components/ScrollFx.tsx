'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Թերթման էֆեկտներ ամբողջ կայքի համար (մեկ requestAnimationFrame-ով).
// • վերևի բարակ ոսկե գիծ՝ որքան է թերթված էջը
// • header-ը թաքնվում է ներքև թերթելիս և երևում վերև թերթելիս
// • մեծ ֆոնային բառերը (.watermark) դանդաղ սահում են հորիզոնական
// • [data-parallax] նկարները թեթև շարժվում են ուղղահայաց
// prefers-reduced-motion-ի դեպքում աշխատում է միայն գիծը։
export default function ScrollFx() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const marks = Array.from(document.querySelectorAll<HTMLElement>('.watermark'));
    const para = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
    let lastY = window.scrollY, raf = 0;
    const frame = () => {
      raf = 0;
      const y = window.scrollY, vh = window.innerHeight;
      const max = Math.max(1, root.scrollHeight - vh);
      root.style.setProperty('--scroll', (y / max).toFixed(4));
      const header = document.querySelector('.siteHeader');
      if (header && !header.classList.contains('menuOpen')) {
        header.classList.toggle('hidden', y > 240 && y > lastY + 2 && !reduce);
        if (y < lastY - 2 || y < 240) header.classList.remove('hidden');
      }
      lastY = y;
      if (reduce) return;
      for (const m of marks) {
        const r = m.parentElement!.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const k = (vh - r.top) / (vh + r.height);           // 0 → 1 while the section crosses the screen
        m.style.transform = `translate3d(${(-k * 14 + 4).toFixed(2)}%,0,0)`;
      }
      for (const el of para) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const k = (r.top + r.height / 2 - vh / 2) / vh;      // -0.5 … 0.5 around the centre
        el.style.transform = `translate3d(0,${(k * -40).toFixed(1)}px,0) scale(1.08)`;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [pathname]);
  return <div className="scrollProgress" aria-hidden="true" />;
}
