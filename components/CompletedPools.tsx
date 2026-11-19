'use client';
import Reveal from './Reveal';
import { useLanguage } from './LanguageContext';
import { common } from '../content/i18n';
import { completedPools } from '../content/siteContent';

// Ավարտված լողավազաններ, որոնց համար կառուցման փուլերի լուսանկարներ չկան. միայն նկար, առանց հղման
export default function CompletedPools() {
  const { lang } = useLanguage();
  const c = common[lang];
  return (
    <div className="completedPools">
      <Reveal><h3 className="completedTitle">{c.completedTitle}</h3></Reveal>
      <div className="completedGrid">
        {completedPools.map((img, i) => (
          <Reveal key={img} delay={i * 60}>
            <figure className="completedTile" style={{ backgroundImage: `url(${img})` }}>
              <div className="projectCardShade" />
              <figcaption><span>{c.poolTag}</span><b>{c.completedMeta}</b></figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
