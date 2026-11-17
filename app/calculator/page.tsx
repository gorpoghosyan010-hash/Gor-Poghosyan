'use client';
import PageHero from '../../components/PageHero';
import { useLanguage } from '../../components/LanguageContext';
import { calculator } from '../../content/i18n';
import CostCalculator from '../../components/CostCalculator';

export default function CalculatorPage() {
  const { lang } = useLanguage();
  const t = calculator[lang];
  return (
    <main className="innerPage">
      <PageHero image="/projects/house-01/06.webp" eyebrow={t.eyebrow} title1={t.title1} title2={t.title2} lead={t.lead} />
      <section className="sectionLight contactPage">
        <CostCalculator />
      </section>
    </main>
  );
}
