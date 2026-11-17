'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Reveal from './Reveal';
import type { NextLink, Project, ProjectImage, Stage } from '../content/projectTypes';
import { useLanguage } from './LanguageContext';
import { common, projectUi } from '../content/i18n';
import { SITE_NAME } from '../content/seo';

// Նկարները ցուցադրվում են ֆայլում նշված հերթականությամբ. եթե նշված են փուլեր (Սկիզբ/Ընթացք/Արդյունք),
// իրար հաջորդող նույն փուլի նկարները խմբավորվում են վերնագրով։
function runs(images: ProjectImage[]) {
  const out: { stage: Stage | null; images: ProjectImage[] }[] = [];
  for (const img of images) {
    const last = out[out.length - 1];
    if (last && last.stage === img.stage) last.images.push(img);
    else out.push({ stage: img.stage, images: [img] });
  }
  return out;
}

export default function ProjectDetail({ project, next }: { project: Project; next: NextLink }) {
  const { lang } = useLanguage();
  const u = projectUi[lang];
  const cat = u.categories[project.category];
  const title = project.title[lang];
  const subtitle = project.subtitle?.[lang];

  useEffect(() => {
    document.title = `${title}${subtitle ? ` — ${subtitle}` : ''} | ${SITE_NAME}`;
  }, [title, subtitle]);

  const f = project.facts;
  const facts = [
    { label: u.facts.type, value: cat.type },
    project.status && { label: u.facts.status, value: u.status[project.status] },
    f.location && { label: u.facts.location, value: f.location[lang] },
    f.area_m2 != null && { label: u.facts.area, value: `${f.area_m2.toLocaleString('en-US')} ${u.facts.areaUnit}` },
    f.duration && { label: u.facts.duration, value: f.duration[lang] },
    f.year != null && { label: u.facts.year, value: String(f.year) }
  ].filter(Boolean) as { label: string; value: string }[];

  const groups = runs(project.images);
  const single = project.images.length === 1;
  let index = 0;

  return <main className="projectDetail">
    <section className="projectHero" style={{ backgroundImage: `url(${project.heroImage})` }}><div className="projectHeroShade" /><div className="projectHeroText"><p className="eyebrow">{u.projectEyebrow} · {cat.tag}</p><h1>{title}{subtitle && <><br /><span>{subtitle}</span></>}</h1>{project.summary && <p>{project.summary[lang]}</p>}</div></section>
    <section className={`projectFacts facts${Math.min(facts.length, 6)}`}>{facts.map(fa => <div key={fa.label}><span>{fa.label}</span><strong>{fa.value}</strong></div>)}</section>
    {project.story && <section className="sectionLight projectIntro"><Reveal className="twoCol"><div><p className="eyebrow dark">{single ? u.introEyebrowSingle : u.introEyebrow}</p><h2>{project.introTitle?.[lang] ?? u.introTitle}<br /><span>{project.introTitle2?.[lang] ?? (project.introTitle ? '' : u.introTitle2)}</span></h2></div><div className="copy"><p>{project.story[lang]}</p></div></Reveal></section>}
    {project.images.length > 0 && <section className={`gallerySection ${single ? 'singleGallery' : ''}`}>
      {groups.map((g, gi) => <div className="galleryGroup" key={gi}>
        {g.stage && <h2 className="stageTitle"><span>{String(gi + 1).padStart(2, '0')}</span>{u.stages[g.stage]}</h2>}
        <div className="gallery">{g.images.map(img => {
          const i = index++;
          const alt = img.caption?.[lang] || `GARON — ${title}${subtitle ? ` ${subtitle}` : ''}${img.stage ? ` · ${u.stages[img.stage]}` : ''} · ${u.photo} ${i + 1}`;
          return <Reveal key={`${img.src}-${i}`} delay={(i % 6) * 30}><figure className="galleryItem"><img src={img.src} alt={alt} width={img.width} height={img.height} loading="lazy" decoding="async" />{img.caption && <figcaption>{img.caption[lang]}</figcaption>}</figure></Reveal>;
        })}</div>
      </div>)}
    </section>}
    <section className="sectionLight pageCta"><Reveal>
      {next.title
        ? <><p className="eyebrow dark">{u.nextEyebrow}</p><h2>{next.title[lang]}{next.subtitle && <><br /><span>{next.subtitle[lang]}</span></>}</h2><Link className="button gold" href={next.href}>{common[lang].nextProjectCta}</Link></>
        : <><p className="eyebrow dark">{u.startEyebrow}</p><h2>{u.startTitle}<br /><span>{u.startTitle2}</span></h2><Link className="button gold" href={next.href}>{common[lang].contactCta}</Link></>}
    </Reveal></section>
  </main>;
}
