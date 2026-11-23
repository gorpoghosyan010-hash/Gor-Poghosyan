'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../../components/LanguageContext';
import { booking } from '../../../content/i18n';
import { siteConfig } from '../../../content/siteConfig';

type Info = { date: string; hour: number; name: string; status: string };

export default function CancelBooking() {
  const { lang } = useLanguage();
  const t = booking[lang];
  const [q, setQ] = useState<{ id: string; t: string } | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [st, setSt] = useState<'loading' | 'notfound' | 'ready' | 'sending' | 'done' | 'already' | 'error'>('loading');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const v = { id: p.get('id') || '', t: p.get('t') || '' };
    setQ(v);
    fetch(`/api/booking/cancel?id=${encodeURIComponent(v.id)}&t=${encodeURIComponent(v.t)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((j: Info) => { setInfo(j); setSt(j.status === 'cancelled' ? 'already' : 'ready'); })
      .catch(() => setSt('notfound'));
  }, []);

  const label = (date: string) => { const d = new Date(`${date}T12:00:00`); return lang === 'en' ? `${t.weekdays[d.getDay()]}, ${t.months[d.getMonth()]} ${d.getDate()}` : `${t.weekdays[d.getDay()]}, ${d.getDate()} ${t.months[d.getMonth()]}`; };
  const cancel = async () => {
    if (!q) return; setSt('sending');
    try { const r = await fetch('/api/booking/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) }); setSt(r.ok ? 'done' : 'error'); }
    catch { setSt('error'); }
  };

  return (
    <main className="innerPage">
      <section className="sectionDark bookingPage cancelPage">
        <div className="bookingCard bookingDone">
          <p className="eyebrow">{t.cEyebrow}</p>
          <h2>{t.cTitle1} <span>{t.cTitle2}</span></h2>
          {st === 'loading' && <p>{t.cLoading}</p>}
          {st === 'notfound' && <p>{t.cNotFound}</p>}
          {info && (st === 'ready' || st === 'sending' || st === 'error') && <>
            <p>{t.cAsk}</p>
            <p className="bookingPicked">{label(info.date)} · {String(info.hour).padStart(2, '0')}:00</p>
            <div className="ctaPair">
              <button className="button gold" onClick={cancel} disabled={st === 'sending'}>{st === 'sending' ? t.sending : t.cButton}</button>
              <Link className="button darkButton outlineLight" href="/">{t.cKeep}</Link>
            </div>
            {st === 'error' && <p className="cancelErr">{t.cError} <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></p>}
          </>}
          {(st === 'done' || st === 'already') && <>
            <span className="bookingCheck" aria-hidden>✓</span>
            <p>{st === 'done' ? t.cDone : t.cAlready}</p>
            <Link className="button gold" href="/booking">{t.cNew}</Link>
          </>}
        </div>
      </section>
    </main>
  );
}
