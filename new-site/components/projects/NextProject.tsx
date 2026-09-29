import Image from 'next/image';
import Link from 'next/link';

export default function NextProject({ href, image, position, label, title, view }: { href: string; image: string; position?: string; label: string; title: string; view: string }) {
  return (
    <Link href={href} data-cursor={view} className="group relative block h-[70svh] min-h-[420px] overflow-hidden">
      <Image
        src={image}
        alt={title}
        fill
        sizes="100vw"
        className="object-cover opacity-50 transition-[transform,opacity] duration-[1.6s] ease-(--ease-expo) group-hover:scale-[1.04] group-hover:opacity-80"
        style={{ objectPosition: position ?? '50% 50%' }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/60" />
      <div className="px-gutter relative flex h-full flex-col items-start justify-end pb-14">
        <span className="eyebrow mb-6">{label}</span>
        <span className="display-xl transition-transform duration-700 ease-(--ease-expo) group-hover:translate-x-4">{title}</span>
        <span aria-hidden className="mt-8 h-px w-24 origin-left bg-bronze transition-transform duration-700 ease-(--ease-expo) group-hover:scale-x-[3]" />
      </div>
    </Link>
  );
}
