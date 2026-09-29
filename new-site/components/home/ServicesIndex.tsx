'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

type Item = { title: string; kicker: string; image: string; href: string };

/**
 * Editorial index of services. On desktop a floating preview image follows the pointer
 * and swaps as you move between rows; on touch a small thumbnail sits in each row.
 */
export default function ServicesIndex({ items }: { items: Item[] }) {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (!preview.current || !list.current) return;
    const r = list.current.getBoundingClientRect();
    preview.current.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0)`;
  };

  return (
    <div className="relative">
      <ul ref={list} onPointerMove={onMove} onPointerLeave={() => setActive(null)} className="relative border-t hairline">
        {items.map((s, i) => (
          <li key={s.href} className="border-b hairline">
            <Link
              href={s.href}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 md:grid-cols-[80px_1fr_1fr_auto] md:gap-8 md:py-9"
            >
              <span className="font-mono text-[11px] text-bronze">0{i + 1}</span>
              <span className="display-md transition-[transform,color] duration-700 ease-(--ease-expo) group-hover:translate-x-3 group-hover:text-bronze-soft">
                {s.title}
              </span>
              <span className="hidden text-sm text-sand transition-colors duration-500 group-hover:text-stone md:block">{s.kicker}</span>
              <span className="relative h-14 w-14 shrink-0 overflow-hidden md:hidden">
                <Image src={s.image} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span aria-hidden className="hidden text-xl text-sand transition-transform duration-700 ease-(--ease-expo) group-hover:-rotate-45 group-hover:text-bronze md:block">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div ref={preview} aria-hidden className="pointer-events-none absolute left-0 top-0 z-10 hidden md:block">
        <div
          className={`relative -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-[opacity,width,height] duration-500 ease-(--ease-expo) ${
            active === null ? 'h-0 w-0 opacity-0' : 'h-[300px] w-[240px] opacity-100'
          }`}
        >
          {items.map((s, i) => (
            <Image
              key={s.image}
              src={s.image}
              alt=""
              fill
              sizes="240px"
              className={`object-cover transition-[opacity,transform] duration-700 ease-(--ease-expo) ${active === i ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
