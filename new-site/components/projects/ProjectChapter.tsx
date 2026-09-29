import Image from 'next/image';
import ParallaxImage from '@/components/ui/ParallaxImage';
import LineToPhoto from '@/components/ui/LineToPhoto';
import Reveal from '@/components/ui/Reveal';
import SplitReveal from '@/components/ui/SplitReveal';
import DragStrip from '@/components/ui/DragStrip';

type Props = {
  number: string;
  title: string;
  text: string;
  images: string[];
  lines?: string;
  focus?: string;
  alt: string;
  dragLabel: string;
};

/** One chapter of a project story: a sticky caption beside progressively revealed imagery. */
export default function ProjectChapter({ number, title, text, images, lines, focus, alt, dragLabel }: Props) {
  const isDrawing = images.length === 1 && images[0].includes('/lines/');

  return (
    <section className="px-gutter border-t hairline py-20 md:py-28">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <span className="font-mono text-[11px] tracking-[0.16em] text-bronze">{number}</span>
            </Reveal>
            <SplitReveal as="h2" className="display-lg mt-4" lines={[title]} />
            <Reveal delay={0.2}>
              <p className="lead mt-6 max-w-sm">{text}</p>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-8">
          {lines ? (
            <LineToPhoto
              pin={false}
              photo={images[0]}
              lines={lines}
              alt={alt}
              position={focus}
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="aspect-[4/3] md:aspect-[16/10]"
            />
          ) : isDrawing ? (
            <Reveal className="relative aspect-[16/10] overflow-hidden bg-ink">
              <div aria-hidden className="grid-lines absolute inset-0 opacity-60" />
              <Image src={images[0]} alt={alt} fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" />
            </Reveal>
          ) : images.length === 1 ? (
            <ParallaxImage src={images[0]} alt={alt} position={focus} sizes="(min-width: 1024px) 66vw, 100vw" className="aspect-[4/3] md:aspect-[16/10]" />
          ) : images.length === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {images.map((src, i) => (
                <ParallaxImage key={src} src={src} alt={`${alt} — ${i + 1}`} position={focus} sizes="(min-width: 1024px) 33vw, 100vw" className={`aspect-[4/5] ${i === 1 ? 'md:mt-24' : ''}`} />
              ))}
            </div>
          ) : (
            <DragStrip images={images} alt={alt} label={dragLabel} />
          )}
        </div>
      </div>
    </section>
  );
}
