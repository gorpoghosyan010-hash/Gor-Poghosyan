import Reveal from './Reveal';

// Ներքին էջերի վերնամաս՝ բաց ֆոն + գծագրի ցանց, ձախում տեքստը, աջում իրական լուսանկար «offset» շրջանակով
export default function PageHero({ image, eyebrow, title1, title2, lead, tag, position = 'center', children }: {
  image: string; eyebrow: string; title1: React.ReactNode; title2?: React.ReactNode; lead?: React.ReactNode;
  tag?: string; position?: string; children?: React.ReactNode;
}) {
  return (
    <section className="pageHero">
      <div className="blueprint" aria-hidden="true" />
      <div className="pageHeroText">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title1}{title2 && <><br /><span>{title2}</span></>}</h1>
          {lead && <p className="pageHeroLead">{lead}</p>}
          {children}
        </Reveal>
      </div>
      <div className="pageHeroMedia">
        <figure className="frame">
          <img src={image} alt="" style={{ objectPosition: position }} fetchPriority="high" />
          {tag && <figcaption className="photoTag">{tag}</figcaption>}
        </figure>
      </div>
    </section>
  );
}
