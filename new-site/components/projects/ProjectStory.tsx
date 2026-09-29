import Link from 'next/link';
import ParallaxImage from '@/components/ui/ParallaxImage';
import Reveal from '@/components/ui/Reveal';

export type StoryItem = {
  href: string;
  index: string;
  total: string;
  image: string;
  position?: string;
  title: string;
  location: string;
  type: string;
  summary: string;
  concept?: string;
  cta: string;
  view: string;
};

/** One project in the vertical portfolio: a large image with a rolling index and a sliding title. */
export default function ProjectStory({ item, flip = false, tall = false }: { item: StoryItem; flip?: boolean; tall?: boolean }) {
  return (
    <article className="group">
      <Link href={item.href} className="grid items-end gap-6 md:grid-cols-12 md:gap-8" aria-label={item.title}>
        <div className={`relative md:col-span-8 ${flip ? 'md:order-2 md:col-start-5' : ''}`}>
          <ParallaxImage
            src={item.image}
            alt={item.title}
            position={item.position}
            sizes="(min-width: 768px) 60vw, 100vw"
            className={tall ? 'aspect-[4/5]' : 'aspect-[16/11]'}
            imgClassName="transition-transform duration-[1.6s] ease-(--ease-expo) group-hover:scale-[1.05]"
            cursor={item.view}
          />
          {item.concept && (
            <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-sand">
              {item.concept}
            </span>
          )}
        </div>

        <Reveal className={`flex flex-col gap-4 md:col-span-4 md:pb-4 ${flip ? 'md:order-1' : ''}`}>
          <span className="flex items-baseline gap-2 font-mono text-[11px] tracking-[0.16em] text-sand">
            <span className="relative inline-block h-[1.2em] overflow-hidden text-bronze">
              <span className="block transition-transform duration-700 ease-(--ease-expo) group-hover:-translate-y-full">{item.index}</span>
              <span aria-hidden className="absolute inset-0 translate-y-full transition-transform duration-700 ease-(--ease-expo) group-hover:translate-y-0">
                {item.index}
              </span>
            </span>
            / {item.total}
          </span>
          <h3 className="display-md transition-transform duration-700 ease-(--ease-expo) group-hover:translate-x-2">{item.title}</h3>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-sand">
            {item.location} · {item.type}
          </p>
          <p className="max-w-sm text-stone/70">{item.summary}</p>
          <span className="mt-2 inline-flex items-center gap-3 text-sm">
            <span className="link-line pb-1 group-hover:bg-[length:100%_1px]">{item.cta}</span>
            <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1 group-hover:text-bronze">
              →
            </span>
          </span>
        </Reveal>
      </Link>
    </article>
  );
}
