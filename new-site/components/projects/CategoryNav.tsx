'use client';

import { useEffect, useState } from 'react';

type Item = { id: string; number: string; title: string; count: number };

/** Category index that sticks under the header and tracks which chapter is on screen. */
export default function CategoryNav({ items, label }: { items: Item[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="glass sticky top-0 z-30 border-x-0">
      <ul className="px-gutter flex gap-6 overflow-x-auto [scrollbar-width:none] md:gap-0 [&::-webkit-scrollbar]:hidden">
        {items.map((c) => (
          <li key={c.id} className="shrink-0 md:flex-1">
            <a
              href={`#${c.id}`}
              aria-current={active === c.id ? 'true' : undefined}
              className="group flex items-baseline gap-3 border-t border-transparent py-5 text-sm text-sand transition-colors aria-[current=true]:border-bronze aria-[current=true]:text-stone md:pr-6"
            >
              <span className="font-mono text-[11px] text-bronze">{c.number}</span>
              <span className="transition-colors group-hover:text-stone">{c.title}</span>
              <span className="font-mono text-[10px] text-dust">({c.count})</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
