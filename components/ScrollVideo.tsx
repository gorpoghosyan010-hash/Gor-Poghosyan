'use client';
import { useEffect, useRef, useState } from 'react';

// Հերոսը էջի վերևում «կպչում» է (sticky), և ներքև թերթելիս տեսանյութը նվագում է թերթման հետ համաձայնեցված
// (թերթում = կադր առաջ, հետ թերթում = կադր հետ)։ Տեսանյութի ավարտից հետո էջը շարունակվում է։
// mobileSrc/mobilePoster՝ հեռախոսի համար առանձին ուղղահայաց տեսանյութ (եթե կա), որը լցնում է ամբողջ էկրանը
export default function ScrollVideo({ src, poster, wide, mobileSrc, mobilePoster, children }: { src: string; poster: string; wide?: boolean; mobileSrc?: string; mobilePoster?: string; children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (!mobileSrc) return;
    const mq = window.matchMedia('(max-width: 850px)');
    const on = () => setIsMobile(mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [mobileSrc]);
  const useMobile = Boolean(mobileSrc && isMobile);
  const vSrc = useMobile ? mobileSrc! : src;
  const vPoster = useMobile ? (mobilePoster || poster) : poster;
  const wrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const backRef = useRef<HTMLVideoElement>(null);

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
      // Հեռախոսում ետևի մշուշոտ պատճենը նույն կադրին է բերվում, որ վիդեոյի սահմանները «տարածվեն» էկրանով մեկ
      const back = backRef.current;
      if (back && back.offsetParent !== null && back.readyState >= 1 && !back.seeking) back.currentTime = t;
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
  }, [vSrc]);

  return (
    <div className="vidWrap" ref={wrapRef}>
      <section className={`serviceDetailHero vidHero${wide ? ' vidWide' : ''}${useMobile ? ' vidMobileFull' : ''}`} ref={heroRef}>
        <div className="vidBackdrop" style={{ backgroundImage: `url(${vPoster})` }} aria-hidden="true" />
        {wide && !useMobile && <video ref={backRef} className="vidBackVid" src={vSrc} poster={vPoster} muted playsInline preload="auto" tabIndex={-1} aria-hidden="true" />}
        <video
          key={vSrc}
          ref={videoRef}
          className="vidEl"
          src={vSrc}
          poster={vPoster}
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
