import type { ReactNode } from 'react';

export type SceneCopy = {
  id: string;
  number: string;
  title: string;
  kicker: string;
  text: string;
  points: string[];
  stages: string[];
};

/**
 * Two-part scene: editorial text on the left, a media "frame" on the right.
 * On desktop the section is exactly one screen tall (it gets pinned); on small screens
 * text and frame simply stack.
 */
export function SceneLayout({
  copy,
  children,
  frameClassName = '',
  flip = false,
  sectionRef
}: {
  copy: SceneCopy;
  children: ReactNode;
  frameClassName?: string;
  flip?: boolean;
  sectionRef: React.Ref<HTMLElement>;
}) {
  return (
    <section ref={sectionRef} id={copy.id} aria-labelledby={`${copy.id}-title`} className="relative scroll-mt-0 overflow-hidden border-t hairline bg-ink lg:h-[100svh]">
      <div aria-hidden className="grid-lines absolute inset-0 opacity-40" />
      <div className={`px-gutter relative grid h-full items-center gap-10 py-20 lg:grid-cols-12 lg:py-0`}>
        <div className={`lg:col-span-4 ${flip ? 'lg:order-2 lg:col-start-9' : ''}`}>
          <p className="flex items-baseline gap-4">
            <span className="font-display text-6xl font-light text-bronze lg:text-7xl">{copy.number}</span>
            <span className="label">{copy.kicker}</span>
          </p>
          <h2 id={`${copy.id}-title`} className="display-lg mt-6">
            {copy.title}
          </h2>
          <p className="mt-6 max-w-md text-stone/75">{copy.text}</p>
          <ul className="mt-8 flex flex-col border-t hairline text-sm">
            {copy.points.map((pt) => (
              <li key={pt} className="flex items-center gap-3 border-b hairline py-3 text-stone/85">
                <span aria-hidden className="h-px w-4 bg-bronze" />
                {pt}
              </li>
            ))}
          </ul>
          <StageLabels stages={copy.stages} />
        </div>
        <div className={`lg:col-span-7 lg:h-[78svh] ${flip ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-6'}`}>
          <div data-frame className={`relative aspect-[4/5] w-full overflow-hidden bg-char sm:aspect-[16/11] lg:aspect-auto lg:h-full ${frameClassName}`}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function StageLabels({ stages }: { stages: string[] }) {
  return (
    <ol className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
      {stages.map((s, i) => (
        <li key={s} data-stage className="group flex items-center gap-3">
          {i > 0 && <span aria-hidden className="h-px w-6 bg-stone/20 transition-colors duration-500 group-data-[active]:bg-bronze" />}
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-dust transition-colors duration-500 group-data-[active]:text-stone">
            <span className="text-bronze">0{i + 1}</span> {s}
          </span>
        </li>
      ))}
    </ol>
  );
}
