'use client';
import { useEffect, useRef } from 'react';

// Հերոսը էջի վերևում «կպչում» է (sticky), և ներքև թերթելիս տեսանյութը նվագում է թերթման հետ համաձայնեցված
// (թերթում = կադր առաջ, հետ թերթում = կադր հետ)։ Տեսանյութի ավարտից հետո էջը շարունակվում է։
export default function ScrollVideo({ src, poster, wide, children }: { src: string; poster: string; wide?: boolean; children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const hero = heroRef.current;
    const video = videoRef.current;
    if (!wrap || !hero || !video) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let target = 0;
    let shown = 0;
    let raf = 0;
    const clamp = (v: number) => Math.min(1, Math.max(0, v));

    // Նոր անցում սկսում ենք միայն նախորդի ավարտից հետո, այլապես բրաուզերը անընդհատ չեղարկում է՝ և կադրը չի թարմանում
    const pump = () => {
      if (!video.duration || video.readyState < 1 || video.seeking) return;
      const t = shown * (video.duration - 0.04);
      if (Math.abs(video.currentTime - t) < 0.004) return;
      video.currentTime = t;
    };
    const seek = pump;
    const tick = () => {
      raf = 0;
      shown += (target - shown) * (reduceMotion.matches ? 1 : 0.2);
      if (Math.abs(target - shown) < 0.0004) shown = target;
      seek();
      if (shown !== target) raf = requestAnimationFrame(tick);
    };
    const readTarget = () => {
      const distance = wrap.offsetHeight - hero.offsetHeight;
      target = distance > 0 ? clamp(-wrap.getBoundingClientRect().top / distance) : 0;
    };
    const onScroll = () => {
      readTarget();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    // iOS-ին անհրաժեշտ է մեկ անգամ նվագարկել/դադարեցնել, որ կադրերը գծվեն
    const unlock = () => {
      video.play().then(() => video.pause()).catch(() => {}).finally(() => { seek(); });
    };

    readTarget();
    shown = target;
    video.addEventListener('loadedmetadata', seek);
    video.addEventListener('seeked', pump);
    video.addEventListener('loadeddata', unlock, { once: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    seek();
    return () => {
      video.removeEventListener('loadedmetadata', seek);
      video.removeEventListener('seeked', pump);
      video.removeEventListener('loadeddata', unlock);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [src]);

  return (
    <div className="vidWrap" ref={wrapRef}>
      <section className={`serviceDetailHero vidHero${wide ? ' vidWide' : ''}`} ref={heroRef}>
        <div className="vidBackdrop" style={{ backgroundImage: `url(${poster})` }} aria-hidden="true" />
        <video
          ref={videoRef}
          className="vidEl"
          src={src}
          poster={poster}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          aria-hidden="true"
        />
        {children}
      </section>
      <div className="vidSpacer" />
    </div>
  );
}
