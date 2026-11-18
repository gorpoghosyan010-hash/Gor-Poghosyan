'use client';
import { useCallback, useEffect, useRef } from 'react';

// Լուսանկարների մեծ դիտում՝ սլաքներ, ստեղնաշար (← → Esc) և մատով սահեցում հեռախոսում։
export type LightboxImage = { src: string; alt: string; caption?: string };

export default function Lightbox({ images, index, onChange, onClose, labels }: {
  images: LightboxImage[]; index: number; onChange: (i: number) => void; onClose: () => void;
  labels: { close: string; prev: string; next: string };
}) {
  const n = images.length;
  const go = useCallback((d: number) => onChange((index + d + n) % n), [index, n, onChange]);
  const startX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [go, onClose]);

  useEffect(() => { closeRef.current?.focus(); }, []);

  // հարևան նկարները նախապես բեռնվում են
  useEffect(() => {
    [1, -1].forEach(d => { const im = new Image(); im.src = images[(index + d + n) % n].src; });
  }, [index, images, n]);

  const img = images[index];
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={img.alt} onClick={onClose}
      onTouchStart={e => { startX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (startX.current == null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        startX.current = null;
      }}>
      <figure onClick={e => e.stopPropagation()}>
        <img key={img.src} src={img.src} alt={img.alt} />
        <figcaption><span>{String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>{img.caption}</figcaption>
      </figure>
      <button ref={closeRef} className="lbClose" onClick={onClose} aria-label={labels.close}>×</button>
      {n > 1 && <>
        <button className="lbNav lbPrev" onClick={e => { e.stopPropagation(); go(-1); }} aria-label={labels.prev}>←</button>
        <button className="lbNav lbNext" onClick={e => { e.stopPropagation(); go(1); }} aria-label={labels.next}>→</button>
      </>}
    </div>
  );
}
