'use client';
import { useCallback, useEffect, useState } from 'react';

// Սեփականատիրոջ էջ. բոլոր գրանցումները և չեղարկման կոճակը (մուտքը՝ BOOKING_ADMIN_PASSWORD)
type B = { id: string; date: string; hour: number; name: string; phone: string; email: string; address: string; note: string; lang: string; createdAt: string; status: 'active' | 'cancelled'; cancelledBy?: string };
const WEEK = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ'];
const MONTH = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'];
const dayLabel = (s: string) => { const d = new Date(`${s}T12:00:00`); return `${WEEK[d.getDay()]}, ${d.getDate()} ${MONTH[d.getMonth()]}`; };
const ERR: Record<string, string> = {
  unauthorized: 'Գաղտնաբառը սխալ է։',
  no_password: 'Գաղտնաբառը դեռ կարգավորված չէ Vercel-ում (BOOKING_ADMIN_PASSWORD)։',
  no_store: 'Գրանցումների պահոցը դեռ միացված չէ (Vercel → Storage → Upstash Redis)։',
  store: 'Պահոցի հետ կապի խնդիր։ Փորձեք մի փոքր ուշ։'
};

export default function Admin() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState<B[]>([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  const load = useCallback(async (p: string) => {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/booking/admin', { headers: { 'x-admin-password': p }, cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) { setErr(ERR[j.error] || 'Սխալ։'); if (r.status === 401) { setAuthed(false); try { sessionStorage.removeItem('bkpw'); } catch {} } return; }
      setList(j.bookings); setAuthed(true);
      try { sessionStorage.setItem('bkpw', p); } catch {}
    } catch { setErr('Կապի խնդիր։'); } finally { setBusy(false); }
  }, []);

  useEffect(() => { try { const s = sessionStorage.getItem('bkpw'); if (s) { setPw(s); load(s); } } catch {} }, [load]);

  const cancel = async (b: B) => {
    if (!confirm(`Չեղարկե՞լ ${b.name}-ի գրանցումը՝ ${dayLabel(b.date)}, ${b.hour}:00։ Ժամը կազատվի։`)) return;
    setBusy(true);
    try {
      const r = await fetch('/api/booking/admin', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': pw }, body: JSON.stringify({ id: b.id }) });
      if (!r.ok) setErr('Չհաջողվեց չեղարկել։');
    } finally { await load(pw); }
  };

  if (!authed) return (
    <main className="innerPage adminPage">
      <form className="adminLogin" onSubmit={e => { e.preventDefault(); load(pw); }}>
        <p className="eyebrow">GARON · ԳՐԱՆՑՈՒՄՆԵՐ</p>
        <h1>Մուտք</h1>
        <label><span>Գաղտնաբառ</span><input type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" autoFocus /></label>
        <button className="button gold" disabled={busy || !pw}>{busy ? '…' : 'Մուտք գործել'}</button>
        {err && <em>{err}</em>}
      </form>
    </main>
  );

  const shown = list.filter(b => showCancelled || b.status === 'active');
  const byDate = shown.reduce<Record<string, B[]>>((a, b) => { (a[b.date] ||= []).push(b); return a; }, {});
  const active = list.filter(b => b.status === 'active').length;

  return (
    <main className="innerPage adminPage">
      <div className="adminHead">
        <div><p className="eyebrow">GARON · ԳՐԱՆՑՈՒՄՆԵՐ</p><h1>Այցելություններ <span>({active})</span></h1></div>
        <div className="adminTools">
          <label className="adminToggle"><input type="checkbox" checked={showCancelled} onChange={e => setShowCancelled(e.target.checked)} /> Ցույց տալ չեղարկվածները</label>
          <button className="button darkButton outlineLight" onClick={() => load(pw)} disabled={busy}>Թարմացնել</button>
          <button className="adminLogout" onClick={() => { try { sessionStorage.removeItem('bkpw'); } catch {} setAuthed(false); setPw(''); setList([]); }}>Ելք</button>
        </div>
      </div>
      {err && <em className="adminErr">{err}</em>}
      {!shown.length && <p className="adminEmpty">Առաջիկա գրանցումներ չկան։</p>}
      {Object.keys(byDate).sort().map(d => (
        <section key={d} className="adminDay">
          <h2>{dayLabel(d)}</h2>
          {byDate[d].sort((a, b) => a.hour - b.hour).map(b => (
            <article key={b.id} className={b.status === 'cancelled' ? 'off' : ''}>
              <b className="adminTime">{String(b.hour).padStart(2, '0')}:00</b>
              <div className="adminInfo">
                <strong>{b.name}</strong>
                <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a>
                {b.email && <a href={`mailto:${b.email}`}>{b.email}</a>}
                {b.address && <span>📍 {b.address}</span>}
                {b.note && <p>{b.note}</p>}
                {b.status === 'cancelled' && <small>Չեղարկված է {b.cancelledBy === 'client' ? 'պատվիրատուի' : 'ձեր'} կողմից</small>}
              </div>
              {b.status === 'active' && <button className="adminCancel" onClick={() => cancel(b)} disabled={busy}>Չեղարկել</button>}
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}
