'use client';
import { useLanguage } from '../../components/LanguageContext';
import { calculator } from '../../content/i18n';
import CostCalculator from '../../components/CostCalculator';

export default function CalculatorPage() {
  const { lang } = useLanguage();
  const t = calculator[lang];
  return (
    <main className="innerPage">
      <section className="innerHero calculatorHero" style={{ backgroundImage: "url('/projects/pool-01/04.webp')" }}>
        <div className="innerHeroShade" />
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title1}<br/><span>{t.title2}</span></h1>
          <p>{t.lead}</p>
        </div>
      </section>
      <section className="sectionLight contactPage">
        <CostCalculator />
      </section>
    </main>
  );
}
