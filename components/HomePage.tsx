'use client';
import Link from 'next/link';
import Reveal from './Reveal';
import ProjectCard from './ProjectCard';
import { useLanguage } from './LanguageContext';
import { home, projectUi } from '../content/i18n';
import type { ProjectCardData } from '../content/projectTypes';

// «Հասարակական կառույցներ»-ը (4-րդ ծառայությունը) գլխավոր էջում չի ցուցադրվում, մնում է /services ցուցակում
const serviceMeta = [
  ['01', '/services/pools', '/projects/pool-01/06.webp'],
  ['02', '/services/residential', '/projects/house-01/11.webp'],
  ['03', '/services/renovation', '/services/renovation.webp']
] as const;

export default function HomePage({ featured }: { featured: ProjectCardData[] }) {
  const { lang } = useLanguage();
  const t = home[lang];
  return <main>
    <section className="homeHero">
      <div className="blueprint" aria-hidden="true" />
      <div className="homeHeroText">
        <Reveal>
          <p className="eyebrow">{t.heroServices}</p>
          <h1>{t.heroTitle1}<br /><span>{t.heroTitle2}</span></h1>
          <p className="pageHeroLead">{t.heroLead}</p>
          <div className="actions">
            <Link className="button gold" href="/calculator">{t.heroCalc}</Link>
            <Link className="button ghost" href="/projects">{t.viewWork}</Link>
          </div>
          <p className="heroRegion">{t.heroRegion}</p>
        </Reveal>
      </div>
      <div className="homeHeroMedia">
        <figure className="frame">
          <img src="/projects/house-01/12.webp" alt="GARON — house" fetchPriority="high" />
          <figcaption className="photoTag">{projectUi[lang].categories.houses.tag} · GARON</figcaption>
        </figure>
      </div>
    </section>

    <section className="section paper homeIntro">
      <span className="watermark" aria-hidden="true">GARON</span>
      <Reveal className="twoCol"><div><p className="eyebrow">{t.philosophyEyebrow}</p><h2 className="ruled">{t.philosophyTitle1}<br /><span>{t.philosophyTitle2}</span></h2></div><div className="copy"><p>{t.philosophyText}</p><Link className="lineLink" href="/about">{t.philosophyLink}</Link></div></Reveal>
    </section>

    <section className="section white homeServices">
      <span className="watermark" aria-hidden="true">{t.wmServices}</span>
      <Reveal className="sectionTop"><div><p className="eyebrow">{t.capabilitiesEyebrow}</p><h2 className="ruled">{t.capabilitiesTitle1}<br /><span>{t.capabilitiesTitle2}</span></h2></div><p>{t.capabilitiesLead}</p></Reveal>
      <div className="serviceCards">{serviceMeta.map(([n, href, img], i) => <Reveal key={n} delay={i * 80}>
        <Link href={href} className="serviceCard">
          <div className="serviceCardImg"><img src={img} alt="" loading="lazy" /></div>
          <div className="serviceCardBody"><span>{n}</span><h3>{t.services[i].t}</h3><p>{t.services[i].d}</p><b>→</b></div>
        </Link>
      </Reveal>)}</div>
    </section>

    {featured.length > 0 && <section className="section paper homeProjects">
      <span className="watermark" aria-hidden="true">{t.wmProjects}</span>
      <Reveal className="sectionTop"><div><p className="eyebrow">{t.selectedWorkEyebrow}</p><h2 className="ruled">{t.selectedWorkTitle1}<br /><span>{t.selectedWorkTitle2}</span></h2></div><Link className="lineLink" href="/projects">{t.openArchive}</Link></Reveal>
      <div className="projectGrid">{featured.map((p, i) => <Reveal key={p.slug} delay={i * 100}><ProjectCard href={`/projects/${p.slug}`} image={p.heroImage} number={projectUi[lang].categories[p.category].tag} title={p.title[lang]} meta={p.meta[lang]} large={i === 0} /></Reveal>)}</div>
    </section>}

    <section className="section stone homeProcess">
      <div className="blueprint" aria-hidden="true" />
      <span className="watermark" aria-hidden="true">{t.wmProcess}</span>
      <Reveal><p className="eyebrow">{t.processEyebrow}</p><h2 className="ruled">{t.processTitle1}<br /><span>{t.processTitle2}</span></h2></Reveal>
      <ol className="timeline">{t.processSteps.map((st, i) => <Reveal key={st.t} delay={i * 80}><li><b>{String(i + 1).padStart(2, '0')}</b><h3>{st.t}</h3><p>{st.d}</p></li></Reveal>)}</ol>
    </section>

    <section className="section white calcTeaser">
      <Reveal className="twoCol"><div><p className="eyebrow">{t.calcTeaserEyebrow}</p><h2 className="ruled">{t.calcTeaserTitle1}<br /><span>{t.calcTeaserTitle2}</span></h2></div><div className="offsetCard"><p>{t.calcTeaserLead}</p><Link className="button gold" href="/calculator">{t.calcTeaserCta}</Link></div></Reveal>
    </section>

    <section className="section paper statement">
      <Reveal><p className="eyebrow">{t.statementEyebrow}</p><h2>{t.statementTitle1}<br /><span>{t.statementTitle2}</span></h2><Link className="button darkButton" href="/contact">{t.statementCta}</Link></Reveal>
    </section>
  </main>;
}
