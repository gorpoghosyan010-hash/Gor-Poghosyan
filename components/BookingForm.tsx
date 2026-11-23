'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { booking } from '../content/i18n';
import { siteConfig } from '../content/siteConfig';

// Երկ–Շբթ, 10:00–17:00 (վերջին այցը՝ 17:00, աշխատանքային օրն ավարտվում է 18:00-ին)։
// Այցերի միջև առնվազն 4 ժամ. ամրագրված ժամի շուրջ ±3 ժամը փակվում է։
const TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const MIN_GAP = 4;
const hourOf = (v: string) => Number(v.slice(0, 2));
const free = (v: string, booked: number[] = []) => booked.every(b => Math.abs(b - hourOf(v)) >= MIN_GAP);
const DAYS_AHEAD = 21;
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function BookingForm() {
  const { lang } = useLanguage();
  const t = booking[lang];
  const days = useMemo(() => {
    const out: Date[] = []; const d = new Date(); d.setHours(12, 0, 0, 0);
    while (out.length < DAYS_AHEAD) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) out.push(new Date(d)); }
    return out;
  }, []);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', note: '', website: '' });
  const [err, setErr] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'fail' | 'taken'>('idle');
  const [cancelUrl, setCancelUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [booked, setBooked] = useState<Record<string, number[]>>({});

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/booking?dates=${days.map(iso).join(',')}`, { cache: 'no-store' });
      if (r.ok) setBooked((await r.json()).booked || {});
    } catch { /* ignore */ }
  }, [days]);
  useEffect(() => { load(); }, [load]);
  const dayFull = (v: string) => TIMES.every(tm => !free(tm, booked[v]));

  const day = days.find(d => iso(d) === date);
  const label = (d: Date) => lang === 'en' ? `${t.weekdays[d.getDay()]}, ${t.months[d.getMonth()]} ${d.getDate()}` : `${t.weekdays[d.getDay()]}, ${d.getDate()} ${t.months[d.getMonth()]}`;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = { date: !date, time: !time, name: !f.name.trim(), phone: f.phone.replace(/\D/g, '').length < 6 };
    setErr(next);
    if (Object.values(next).some(Boolean)) return;
    setState('sending');
    try {
      const r = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, date, time, dateLabel: day ? label(day) : '', lang }) });
      if (r.ok) { const j = await r.json().catch(() => ({})); setCancelUrl(j.cancelUrl || ''); setCopied(false); setState('done'); load(); return; }
      if (r.status === 409) { setState('taken'); setTime(''); load(); return; }
    } catch { /* fall through */ }
    // Եթե ծանուցումը դեռ կարգավորված չէ կամ չհաջողվեց՝ բացում ենք նամակ նույն տվյալներով, որ հայտը չկորի
    setState('fail');
    const lines = [`${t.stepDate}: ${day ? label(day) : date}`, `${t.stepTime}: ${time}`, `${t.name}: ${f.name}`, `${t.phone}: ${f.phone}`, f.email && `${t.email}: ${f.email}`, f.address && `${t.address}: ${f.address}`, f.note && `\n${f.note}`].filter(Boolean).join('\n');
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(`GARON — ${t.title1} ${t.title2}`)}&body=${encodeURIComponent(lines)}`;
  };

  if (state === 'done') return (
    <div className="bookingDone">
      <span className="bookingCheck" aria-hidden>✓</span>
      <h2>{t.doneTitle}</h2>
      <p>{t.doneText}</p>
      {day && <p className="bookingPicked">{label(day)} · {time}</p>}
      {cancelUrl && <div className="bookingCancelBox">
        <p>{t.cancelSave}</p>
        <div><a href={cancelUrl}>{t.cancelLinkText}</a><button type="button" onClick={() => { navigator.clipboard?.writeText(cancelUrl).then(() => setCopied(true)).catch(() => {}); }}>{copied ? t.copied : t.copy}</button></div>
      </div>}
      <button className="button gold" onClick={() => { setState('idle'); setDate(''); setTime(''); setF({ name: '', phone: '', email: '', address: '', note: '', website: '' }); }}>{t.again}</button>
    </div>
  );

  return (
    <form className="bookingForm" onSubmit={submit} noValidate>
      <fieldset>
        <legend><b>01</b>{t.stepDate}</legend>
        <div className="dayGrid">
          {days.map(d => {
            const v = iso(d);
            const full = dayFull(v);
            return <button type="button" key={v} disabled={full} className={v === date ? 'on' : ''} aria-pressed={v === date} onClick={() => { setDate(v); if (time && !free(time, booked[v])) setTime(''); setErr({ ...err, date: false }); }}>
              <small>{t.weekdays[d.getDay()]}</small><strong>{d.getDate()}</strong><small>{t.monthsShort[d.getMonth()]}</small>
            </button>;
          })}
        </div>
        {err.date && <em>{t.pickDate}</em>}
      </fieldset>
      <fieldset>
        <legend><b>02</b>{t.stepTime}</legend>
        <div className="timeGrid">
          {TIMES.map(v => { const ok = !date || free(v, booked[date]); return <button type="button" key={v} disabled={!ok} title={ok ? undefined : t.busy} className={v === time ? 'on' : ''} aria-pressed={v === time} onClick={() => { setTime(v); setErr({ ...err, time: false }); if (state === 'taken') setState('idle'); }}>{v}</button>; })}
        </div>
        {err.time && <em>{t.pickTime}</em>}
        {state === 'taken' && <em>{t.takenText}</em>}
        <small className="bookingHint">{t.note2}</small>
      </fieldset>
      <fieldset className="bookingInfo">
        <legend><b>03</b>{t.stepInfo}</legend>
        <div className="contactFormRow">
          <label className={err.name ? 'invalid' : ''}><span>{t.name}</span><input value={f.name} onChange={set('name')} autoComplete="name" aria-invalid={!!err.name} />{err.name && <em>{t.required}</em>}</label>
          <label className={err.phone ? 'invalid' : ''}><span>{t.phone}</span><input type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" aria-invalid={!!err.phone} />{err.phone && <em>{t.required}</em>}</label>
        </div>
        <div className="contactFormRow">
          <label><span>{t.email}</span><input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
          <label><span>{t.address}</span><input value={f.address} onChange={set('address')} autoComplete="street-address" /></label>
        </div>
        <label><span>{t.note}</span><textarea rows={3} value={f.note} onChange={set('note')} /></label>
        <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />
      </fieldset>
      <div className="bookingSubmit">
        {day && time && <p><small>{t.summary}</small><strong>{label(day)} · {time}</strong></p>}
        <button className="button gold" type="submit" disabled={state === 'sending'}>{state === 'sending' ? t.sending : t.submit}</button>
      </div>
      {state === 'fail' && <em>{t.failText} <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></em>}
    </form>
  );
}
