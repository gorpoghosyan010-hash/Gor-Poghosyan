'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { SceneLayout, type SceneCopy } from './SceneLayout';
import { useScene } from './useScene';
import StructuralGrid from '@/components/drawings/StructuralGrid';

const SIZES = '(min-width: 1024px) 58vw, 100vw';

/** Scrubs a <video> element's currentTime from `from` to `to` (0..1) as the tween progresses. */
function scrubVideo(tl: gsap.core.Timeline, video: HTMLVideoElement | null, from: number, to: number, duration: number, at: number) {
  const state = { p: from };
  tl.to(
    state,
    {
      p: to,
      duration,
      onUpdate: () => {
        if (video && video.duration) video.currentTime = state.p * (video.duration - 0.05);
      }
    },
    at
  );
}

/** iOS paints seeked frames only after the video has played once. */
function primeVideo(v: HTMLVideoElement | null) {
  if (!v) return;
  v.play()
    .then(() => v.pause())
    .catch(() => {});
}

/* ARCHITECTURE — the drawing (extracted from the photo) sweeps in, the building rises underneath. */
export function ArchitectureScene({ copy, alt }: { copy: SceneCopy; alt: string }) {
  const root = useRef<HTMLElement>(null);
  useScene(
    root,
    (tl, q) => {
      tl.fromTo(q('[data-lines]'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 })
        .fromTo(q('[data-scan]'), { xPercent: 0, opacity: 1 }, { xPercent: 100, duration: 1 }, 0)
        .to(q('[data-scan]'), { opacity: 0, duration: 0.05 }, 1)
        .fromTo(q('[data-photo]'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1 }, 1.1)
        .fromTo(q('[data-photo] img'), { scale: 1.15 }, { scale: 1, duration: 1.5 }, 1.1)
        .to(q('[data-lines]'), { opacity: 0, duration: 0.6 }, 1.9)
        .to({}, { duration: 0.3 });
    },
    (q) => {
      gsap.set(q('[data-lines], [data-scan]'), { opacity: 0 });
      gsap.set(q('[data-photo]'), { clipPath: 'none' });
    }
  );

  return (
    <SceneLayout copy={copy} sectionRef={root}>
      <div data-photo className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(100% 0% 0% 0%)' }}>
        <Image src="/media/services/residential-hero.webp" alt={alt} fill sizes={SIZES} className="object-cover" style={{ objectPosition: '45% 50%' }} />
      </div>
      <div data-lines aria-hidden className="absolute inset-0" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
        <Image src="/media/lines/villa-lines.webp" alt="" fill sizes={SIZES} className="object-cover" style={{ objectPosition: '45% 50%' }} />
      </div>
      <div aria-hidden data-scan className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-px bg-bronze shadow-[0_0_24px_4px_rgba(194,155,98,0.45)]" />
      </div>
    </SceneLayout>
  );
}

/* ENGINEERING — the structural grid draws itself, then the district is built out of it. */
export function EngineeringScene({ copy, alt }: { copy: SceneCopy; alt: string }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useScene(
    root,
    (tl, q) => {
      primeVideo(video.current);
      const groups = ['axes', 'bubbles', 'beams', 'columns', 'brace', 'loads', 'dims'];
      gsap.set(q('[data-grid] [data-g="axes"]'), { opacity: 0 });
      tl.to(q('[data-grid] [data-g="axes"]'), { opacity: 0.5, duration: 0.2 }, 0);
      groups.slice(1).forEach((g, i) => {
        const sel = `[data-grid] [data-g="${g}"]`;
        tl.to(q(`${sel} circle, ${sel} path, ${sel} rect`), { strokeDashoffset: 0, duration: 0.35, stagger: 0.01 }, 0.1 + i * 0.12);
      });
      tl.fromTo(q('[data-grid] text'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.3)
        .fromTo(q('[data-media]'), { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.95)
        .to(q('[data-grid]'), { opacity: 0.18, duration: 0.35 }, 0.95);
      scrubVideo(tl, video.current, 0, 1, 1.3, 1.1);
      tl.fromTo(q('[data-lines]'), { opacity: 0 }, { opacity: 0.9, duration: 0.25 }, 2.3)
        .to(q('[data-grid]'), { opacity: 0, duration: 0.25 }, 2.3)
        .to(q('[data-lines]'), { opacity: 0, duration: 0.3 }, 2.65)
        .to({}, { duration: 0.1 });
    },
    (q) => {
      gsap.set(q('[data-grid], [data-lines]'), { opacity: 0 });
      gsap.set(q('[data-media]'), { opacity: 1 });
    },
    '+=240%'
  );

  return (
    <SceneLayout copy={copy} sectionRef={root} flip>
      <div data-media className="absolute inset-0 opacity-0">
        <Image src="/media/frames/city-end.webp" alt={alt} fill sizes={SIZES} className="object-cover" />
        <video
          ref={video}
          src="/media/video/city-build.mp4"
          poster="/media/frames/city-start.webp"
          muted
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        />
        <div aria-hidden className="absolute inset-0 bg-ink/15" />
      </div>
      <div data-lines aria-hidden className="absolute inset-0 opacity-0">
        <Image src="/media/lines/city-lines.webp" alt="" fill sizes={SIZES} className="object-cover" />
      </div>
      <div data-grid aria-hidden className="absolute inset-0 p-4 text-bronze-soft md:p-8">
        <StructuralGrid className="h-full w-full" />
      </div>
    </SceneLayout>
  );
}

/* CONSTRUCTION / POOLS — real site photographs rise one over another, stage by stage. */
export function SequenceScene({ copy, images, alt, flip = false }: { copy: SceneCopy; images: string[]; alt: string; flip?: boolean }) {
  const root = useRef<HTMLElement>(null);
  useScene(
    root,
    (tl, q) => {
      const layers = q('[data-layer]');
      const bar = q('[data-bar]');
      layers.forEach((layer, i) => {
        if (i === 0) {
          tl.fromTo(layer.querySelector('img'), { scale: 1.1 }, { scale: 1, duration: 1 }, 0);
          return;
        }
        const at = i;
        tl.fromTo(layer, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power2.inOut' }, at - 0.35)
          .fromTo(layer.querySelector('img'), { scale: 1.18 }, { scale: 1, duration: 1.2 }, at - 0.35)
          .to(layers[i - 1], { opacity: 0.4, duration: 0.7 }, at - 0.35);
      });
      tl.fromTo(bar, { scaleY: 0 }, { scaleY: 1, duration: layers.length - 0.5 }, 0);
    },
    (q) => {
      q('[data-layer]').forEach((el) => gsap.set(el, { clipPath: 'none' }));
    },
    `+=${images.length * 55}%`
  );

  return (
    <SceneLayout copy={copy} sectionRef={root} flip={flip}>
      {images.map((src, i) => (
        <div key={src} data-layer className="absolute inset-0 overflow-hidden" style={i === 0 ? undefined : { clipPath: 'inset(100% 0% 0% 0%)' }}>
          <Image src={src} alt={`${alt} — ${copy.stages[i] ?? i + 1}`} fill sizes={SIZES} className="object-cover" />
          <span className="glass absolute bottom-4 left-4 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-stone">
            0{i + 1} · {copy.stages[i]}
          </span>
        </div>
      ))}
      <div aria-hidden className="absolute bottom-0 right-0 top-0 w-px bg-stone/15">
        <div data-bar className="h-full w-px origin-top scale-y-0 bg-bronze" />
      </div>
    </SceneLayout>
  );
}

/* RENOVATION — the future interior is drawn over the bare apartment, then the film turns it into reality. */
export function RenovationScene({ copy, alt }: { copy: SceneCopy; alt: string }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useScene(
    root,
    (tl, q) => {
      primeVideo(video.current);
      tl.fromTo(q('[data-lines]'), { clipPath: 'inset(0% 0% 0% 100%)', opacity: 1 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8 }, 0)
        .to(q('[data-shade]'), { opacity: 0.55, duration: 0.8 }, 0)
        .to(q('[data-shade]'), { opacity: 0, duration: 0.6 }, 1.0);
      scrubVideo(tl, video.current, 0, 1, 1.6, 0.9);
      tl.to(q('[data-lines]'), { opacity: 0, duration: 0.6 }, 1.9).to({}, { duration: 0.2 });
    },
    (q) => {
      gsap.set(q('[data-lines], [data-shade]'), { opacity: 0 });
      gsap.set(q('[data-after]'), { opacity: 1 });
    },
    '+=220%'
  );

  return (
    <SceneLayout copy={copy} sectionRef={root}>
      <Image src="/media/frames/renovation-before.webp" alt={alt} fill sizes={SIZES} className="object-cover" />
      <video
        ref={video}
        src="/media/video/renovation.mp4"
        poster="/media/frames/renovation-before.webp"
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
      />
      <div data-after aria-hidden className="absolute inset-0 opacity-0">
        <Image src="/media/frames/renovation-after.webp" alt="" fill sizes={SIZES} className="object-cover" />
      </div>
      <div data-shade aria-hidden className="absolute inset-0 bg-ink opacity-0" />
      <div data-lines aria-hidden className="absolute inset-0" style={{ clipPath: 'inset(0% 0% 0% 100%)' }}>
        <Image src="/media/lines/interior-lines.webp" alt="" fill sizes={SIZES} className="object-cover" />
      </div>
    </SceneLayout>
  );
}
