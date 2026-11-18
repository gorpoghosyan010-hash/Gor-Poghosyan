import HeroVideo, { type HeroVideoMode } from './HeroVideo';

// Էջերի վերնամաս՝ բաց ֆոն + գծագրի ցանց, ձախում տեքստը, աջում իրական լուսանկար կամ տեսանյութ «offset» շրջանակով։
// Տեսանյութով (mode="scrub") վերնամասը համակարգչում կպչուն է, և տեսանյութը նվագում է թերթելիս։
export type HeroMedia = { video?: string; poster?: string; mode?: HeroVideoMode; ratio?: string };

export default function PageHero({ image, eyebrow, title1, title2, lead, tag, position = 'center', media, home = false, children }: {
  image: string; eyebrow: string; title1: React.ReactNode; title2?: React.ReactNode; lead?: React.ReactNode;
  tag?: string; position?: string; media?: HeroMedia; home?: boolean; children?: React.ReactNode;
}) {
  const scrub = media?.video && (media.mode ?? 'scrub') === 'scrub';
  const [rw, rh] = (media?.ratio ?? '4/3').split('/').map(Number);
  const portrait = rw / rh < 1;
  const hero = (
    <section className={`pageHero${home ? ' homeHero' : ''}${media?.video ? ' hasVideo' : ''}`}>
      <div className="blueprint" aria-hidden="true" />
      <div className="pageHeroText">
        <p className="eyebrow heroIn" style={{ '--i': 0 } as React.CSSProperties}>{eyebrow}</p>
        <h1 className="heroIn" style={{ '--i': 1 } as React.CSSProperties}>{title1}{title2 && <><br /><span>{title2}</span></>}</h1>
        {lead && <p className="pageHeroLead heroIn" style={{ '--i': 2 } as React.CSSProperties}>{lead}</p>}
        {children && <div className="heroIn" style={{ '--i': 3 } as React.CSSProperties}>{children}</div>}
      </div>
      <div className="pageHeroMedia">
        <figure className={`frame heroFrame${portrait ? ' portrait' : ''}`} style={media?.ratio ? { aspectRatio: media.ratio } : undefined}>
          {media?.video
            ? <HeroVideo src={media.video} poster={media.poster ?? image} mode={media.mode} />
            : <img src={image} alt="" style={{ objectPosition: position }} fetchPriority="high" />}
          {tag && <figcaption className="photoTag">{tag}</figcaption>}
          {media?.video && <span className="heroProgress" aria-hidden="true" />}
        </figure>
        {scrub && <span className="scrollHint" aria-hidden="true"><i /></span>}
      </div>
    </section>
  );
  if (!scrub) return hero;
  return <div className="heroScrollWrap">{hero}<div className="heroSpacer" /></div>;
}
