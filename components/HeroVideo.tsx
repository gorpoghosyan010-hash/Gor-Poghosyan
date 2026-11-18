'use client';
import { useEffect, useRef, useState } from 'react';

// Վերնամասի տեսանյութը շրջանակի ներսում։
// mode="scrub" — համակարգչում տեսանյութը «նվագում է» թերթելիս (ներքև = առաջ, վերև = հետ), վերնամասը կպչուն է։
//               Հեռախոսում և Data Saver-ով՝ ավտոմատ նվագարկում (առանց ձայնի, կրկնվող), միայն երբ երևում է էկրանին։
// mode="once"  — նվագում է մեկ անգամ և կանգնում վերջին կադրի վրա (գլխավոր էջ. հիմքից մինչև պատրաստ տուն)։
// mode="loop"  — նվագում է անընդհատ, երբ երևում է։
export type HeroVideoMode = 'scrub' | 'once' | 'loop';

export default function HeroVideo({ src, poster, mode = 'scrub' }: { src: string; poster: string; mode?: HeroVideoMode }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [scrub, setScrub] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 851px)');
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const save = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const update = () => { setScrub(mode === 'scrub' && desktop.matches && !save && !rm.matches); setReduce(rm.matches); };
    update();
    desktop.addEventListener('change', update);
    return () => desktop.removeEventListener('change', update);
  }, [mode]);

  // Ավտոմատ նվագարկում՝ միայն տեսանելի լինելու դեպքում
  useEffect(() => {
    const v = ref.current;
    if (!v || scrub || reduce) return;
    v.loop = mode !== 'once';
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!(mode === 'once' && v.ended)) v.play().catch(() => {}); }
      else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    const tick = () => progress(v, v.duration ? v.currentTime / v.duration : 0);
    v.addEventListener('timeupdate', tick);
    return () => { io.disconnect(); v.removeEventListener('timeupdate', tick); };
  }, [scrub, reduce, mode]);

  // Թերթման հետ համաձայնեցված նվագարկում
  useEffect(() => {
    const v = ref.current;
    const wrap = v?.closest('.heroScrollWrap') as HTMLElement | null;
    const hero = wrap?.querySelector('.pageHero') as HTMLElement | null;
    wrap?.classList.toggle('scrubOn', scrub);
    if (!scrub || !v || !wrap || !hero) return;
    v.pause();
    let target = 0, shown = 0, raf = 0;
    const clamp = (x: number) => Math.min(1, Math.max(0, x));
    const seek = () => {
      if (!v.duration || v.readyState < 1 || v.seeking) return;
      const t = shown * (v.duration - 0.05);
      if (Math.abs(v.currentTime - t) > 0.004) v.currentTime = t;
    };
    const tick = () => {
      raf = 0;
      shown += (target - shown) * 0.18;
      if (Math.abs(target - shown) < 0.0005) shown = target;
      seek();
      progress(v, shown);
      if (shown !== target) raf = requestAnimationFrame(tick);
    };
    const read = () => {
      const dist = wrap.offsetHeight - hero.offsetHeight;
      target = dist > 0 ? clamp(-wrap.getBoundingClientRect().top / dist) : 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const unlock = () => { v.play().then(() => v.pause()).catch(() => {}).finally(seek); };
    read(); shown = target;
    v.addEventListener('loadedmetadata', seek);
    v.addEventListener('seeked', seek);
    v.addEventListener('loadeddata', unlock, { once: true });
    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read);
    return () => {
      v.removeEventListener('loadedmetadata', seek);
      v.removeEventListener('seeked', seek);
      v.removeEventListener('loadeddata', unlock);
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', read);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrub]);

  return (
    <video
      ref={ref}
      className="heroVideo"
      src={reduce ? undefined : src}
      poster={poster}
      muted
      playsInline
      autoPlay={false}
      preload={scrub ? 'auto' : 'metadata'}
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}

// Շրջանակի տակի բարակ ոսկե գիծը ցույց է տալիս, թե տեսանյութի որ մասում ենք (Սկիզբ → Արդյունք)
function progress(v: HTMLVideoElement, p: number) {
  v.parentElement?.style.setProperty('--p', p.toFixed(4));
}
