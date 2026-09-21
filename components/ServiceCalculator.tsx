'use client';
import Reveal from './Reveal';
import CostCalculator, { Mode } from './CostCalculator';
import { useLanguage } from './LanguageContext';
import { calculator } from '../content/i18n';

export default function ServiceCalculator({ kind, modes }: { kind: 'pool' | 'residential' | 'renovation'; modes: Mode[] }) {
  const { lang } = useLanguage();
  const t = calculator[lang];
  const s = t.service[kind];
  return (
    <section className="sectionLight contactPage serviceCalc">
      <Reveal>
        <p className="eyebrow dark">{t.eyebrow}</p>
        <h2>{s.title1}<br/><span>{s.title2}</span></h2>
        <p className="serviceCalcLead">{s.lead}</p>
      </Reveal>
      <CostCalculator modes={modes} />
    </section>
  );
}
