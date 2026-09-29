'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Google Maps embed, tinted to the site palette. The iframe is only created once the section
 * approaches the viewport, so the map costs nothing on first load.
 */
export default function MapSection({
  query,
  title,
  eyebrow,
  heading,
  open,
  coordinates,
  address
}: {
  query: string;
  title: string;
  eyebrow: string;
  heading: string;
  open: string;
  coordinates: string;
  address: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: '400px' });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const q = encodeURIComponent(query);

  return (
    <section aria-label={heading} className="relative border-t hairline">
      <div ref={ref} className="relative h-[70svh] min-h-[420px] overflow-hidden bg-graphite">
        {load && (
          <iframe
            title={title}
            src={`https://www.google.com/maps?q=${q}&z=12&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 [filter:grayscale(1)_invert(.92)_contrast(.9)_sepia(.18)_brightness(.95)]"
          />
        )}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(11,10,9,.7)_100%)]" />
        <div className="px-gutter pointer-events-none absolute inset-x-0 bottom-0 pb-8 md:pb-12">
          <div className="glass pointer-events-auto inline-flex flex-col gap-3 rounded-sm p-6 md:p-8">
            <span className="eyebrow">{eyebrow}</span>
            <span className="display-md">{heading}</span>
            <span className="font-mono text-[11px] tracking-[0.16em] text-sand">
              {coordinates} · {address}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${q}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-line mt-2 w-fit pb-1 text-sm text-stone"
            >
              {open} ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
