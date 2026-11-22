'use client';
import Reveal from '../../components/Reveal';
import BookingForm from '../../components/BookingForm';
import { useLanguage } from '../../components/LanguageContext';
import { booking } from '../../content/i18n';

export default function Booking() {
  const { lang } = useLanguage();
  const t = booking[lang];
  return (
    <main className="innerPage">
      <section className="innerHero bookingHero" style={{ backgroundImage: "url('/home/hero-hall-desktop.webp')" }}>
        <div className="innerHeroShade" />
        <div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title1}<br /><span>{t.title2}</span></h1><p>{t.lead}</p></div>
      </section>
      <section className="sectionDark bookingPage"><Reveal><div className="bookingCard"><BookingForm /></div></Reveal></section>
    </main>
  );
}
