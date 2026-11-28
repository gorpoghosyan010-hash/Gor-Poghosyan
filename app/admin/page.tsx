'use client';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PRICING, MODES, type Extra, type Mode, type Pricing } from '../../lib/pricing';

// Սեփականատիրոջ էջ. գրանցումներ, գներ, այցելություններ (մուտքը՝ ADMIN_PASSWORD)

const ERR: Record<string, string> = {
  unauthorized: 'Գաղտնաբառը սխալ է։',
  no_password: 'Գաղտնաբառը դեռ կարգավորված չէ Vercel-ում (ADMIN_PASSWORD)։',
  no_store: 'Պահոցը դեռ միացված չէ (Vercel → Storage → Upstash Redis)։',
  store: 'Պահոցի հետ կապի խնդիր։ Փորձեք մի փոքր ուշ։',
  bad_json: 'Սխալ տվյալներ։'
};
const errText = (e?: string) => (e && ERR[e]) || 'Սխալ։ Փորձեք կրկին։';

type Api = <T = Record<string, unknown>>(url: string, init?: RequestInit) => Promise<{ ok: boolean; status: number; data: T & { error?: string } }>;

export default function AdminPage() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'bookings' | 'prices' | 'stats'>('bookings');

  const api: Api = useCallback(async (url, init = {}) => {
    const r = await fetch(url, { ...init, cache: 'no-store', headers: { ...(init.headers || {}), 'x-admin-password': pw, ...(init.body ? { 'Content-Type': 'application/json' } : {}) } });
    const data = await r.json().catch(() => ({}));
    if (r.status === 401) { setAuthed(false); try { sessionStorage.removeItem('admpw'); } catch {} }
    return { ok: r.ok, status: r.status, data };
  }, [pw]);

  const login = useCallback(async (p: string) => {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/admin/prices', { headers: { 'x-admin-password': p }, cache: 'no-store' });
      if (r.status === 401) { const j = await r.json().catch(() => ({})); setErr(errText(j.error)); try { sessionStorage.removeItem('admpw'); } catch {} return; }
      setAuthed(true);
      try { sessionStorage.setItem('admpw', p); } catch {}
    } catch { setErr('Կապի խնդիր։'); } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    try { const s = sessionStorage.getItem('admpw') || sessionStorage.getItem('bkpw'); if (s) { setPw(s); login(s); } } catch {}
    try { const t = new URLSearchParams(window.location.search).get('tab'); if (t === 'prices' || t === 'stats') setTab(t); } catch {}
  }, [login]);

  if (!authed) return (
    <main className="innerPage adminPage">
      <form className="adminLogin" onSubmit={e => { e.preventDefault(); login(pw); }}>
        <p className="eyebrow">GARON · ԱԴՄԻՆ</p>
        <h1>Մուտք</h1>
        <label><span>Գաղտնաբառ</span><input type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" autoFocus /></label>
        <button className="button gold" disabled={busy || !pw}>{busy ? '…' : 'Մուտք գործել'}</button>
        {err && <em>{err}</em>}
      </form>
    </main>
  );

  return (
    <main className="innerPage adminPage">
      <div className="adminHead">
        <div><p className="eyebrow">GARON · ԱԴՄԻՆ</p><h1>Կառավարում</h1></div>
        <button className="adminLogout" onClick={() => { try { sessionStorage.removeItem('admpw'); sessionStorage.removeItem('bkpw'); } catch {} setAuthed(false); setPw(''); }}>Ելք</button>
      </div>
      <nav className="adminTabs">
        {([['bookings', 'Գրանցումներ'], ['prices', 'Գներ'], ['stats', 'Այցելություններ']] as const).map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </nav>
      {tab === 'bookings' && <Bookings api={api} />}
      {tab === 'prices' && <Prices api={api} />}
      {tab === 'stats' && <Stats api={api} />}
    </main>
  );
}

/* ---------------- Գրանցումներ ---------------- */

type B = { id: string; date: string; hour: number; name: string; phone: string; email: string; address: string; note: string; lang: string; createdAt: string; status: 'active' | 'cancelled'; cancelledBy?: string };
const WEEK = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ'];
const MONTH = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'];
const dayLabel = (s: string) => { const d = new Date(`${s}T12:00:00`); return `${WEEK[d.getDay()]}, ${d.getDate()} ${MONTH[d.getMonth()]}`; };

function Bookings({ api }: { api: Api }) {
  const [list, setList] = useState<B[]>([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  const load = useCallback(async () => {
    setBusy(true); setErr('');
    try {
      const r = await api<{ bookings: B[] }>('/api/booking/admin');
      if (r.ok) setList(r.data.bookings); else setErr(errText(r.data.error));
    } catch { setErr('Կապի խնդիր։'); } finally { setBusy(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const cancel = async (b: B) => {
    if (!confirm(`Չեղարկե՞լ ${b.name}-ի գրանցումը՝ ${dayLabel(b.date)}, ${b.hour}:00։ Ժամը կազատվի։`)) return;
    setBusy(true);
    try { const r = await api('/api/booking/admin', { method: 'POST', body: JSON.stringify({ id: b.id }) }); if (!r.ok) setErr('Չհաջողվեց չեղարկել։'); }
    finally { await load(); }
  };

  const shown = list.filter(b => showCancelled || b.status === 'active');
  const byDate = shown.reduce<Record<string, B[]>>((a, b) => { (a[b.date] ||= []).push(b); return a; }, {});
  const active = list.filter(b => b.status === 'active').length;

  return (
    <section>
      <div className="adminBar">
        <h2>Այցելություն և չափագրում <span>({active})</span></h2>
        <div className="adminTools">
          <label className="adminToggle"><input type="checkbox" checked={showCancelled} onChange={e => setShowCancelled(e.target.checked)} /> Ցույց տալ չեղարկվածները</label>
          <button className="button darkButton outlineLight" onClick={load} disabled={busy}>Թարմացնել</button>
        </div>
      </div>
      {err && <em className="adminErr">{err}</em>}
      {!err && !shown.length && <p className="adminEmpty">{busy ? 'Բեռնվում է…' : 'Առաջիկա գրանցումներ չկան։'}</p>}
      {Object.keys(byDate).sort().map(d => (
        <section key={d} className="adminDay">
          <h3>{dayLabel(d)}</h3>
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
    </section>
  );
}

/* ---------------- Գներ ---------------- */

const MODE_LABEL: Record<Mode, string> = { full: 'Ամբողջական կառուցում', monolith: 'Միայն մոնոլիտ', renovation: 'Վերանորոգում', pool: 'Լողավազան' };
const KIND_LABEL: Record<Extra['kind'], string> = { perSqm: '֏ / մ²', fixed: '֏ (ֆիքսված)', percent: '% ընդհանուր գնից' };
const TIERS = ['Ստանդարտ', 'Կոմֆորտ', 'Պրեմիում'];
const fmt = (n: number) => n.toLocaleString('en-US');

function NumField({ label, value, onChange, suffix = '֏ / մ²', hint }: { label: string; value: number; onChange: (n: number) => void; suffix?: string; hint?: string }) {
  return (
    <label className="admField">
      <span>{label}</span>
      <div><input type="number" min={0} inputMode="numeric" value={Number.isFinite(value) ? value : ''} onChange={e => onChange(e.target.value === '' ? 0 : Math.max(0, Math.round(Number(e.target.value))))} /><i>{suffix}</i></div>
      {hint && <small>{hint}</small>}
    </label>
  );
}

function Prices({ api }: { api: Api }) {
  const [p, setP] = useState<Pricing | null>(null);
  const [store, setStore] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api<{ pricing: Pricing; store: boolean }>('/api/admin/prices').then(r => {
      if (r.ok) { setP(r.data.pricing); setStore(r.data.store); } else setMsg({ ok: false, text: errText(r.data.error) });
    }).catch(() => setMsg({ ok: false, text: 'Կապի խնդիր։' }));
  }, [api]);

  if (!p) return <p className="adminEmpty">{msg?.text || 'Բեռնվում է…'}</p>;

  const up = (patch: Partial<Pricing>) => { setP({ ...p, ...patch }); setDirty(true); setMsg(null); };
  const setTri = (key: 'renovation' | 'houseFinish', i: number, v: number) => { const a = [...p[key]] as [number, number, number]; a[i] = v; up({ [key]: a }); };
  const setExtra = (i: number, patch: Partial<Extra>) => up({ extras: p.extras.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const addExtra = () => up({ extras: [...p.extras, { id: `x${Date.now().toString(36)}`, label: { hy: '', en: '', ru: '' }, modes: ['full'], kind: 'perSqm', value: 0 }] });

  const save = async () => {
    const bad = p.extras.findIndex(x => !x.label.hy.trim());
    if (bad >= 0) { setMsg({ ok: false, text: `Լրացրեք ${bad + 1}-րդ հավելյալ տողի հայերեն անունը կամ ջնջեք այն։` }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ pricing: Pricing }>('/api/admin/prices', { method: 'PUT', body: JSON.stringify(p) });
      if (r.ok) { setP(r.data.pricing); setDirty(false); setMsg({ ok: true, text: 'Պահպանված է։ Կայքում նոր գները կերևան մինչև 1 րոպեում։' }); }
      else setMsg({ ok: false, text: errText(r.data.error) });
    } catch { setMsg({ ok: false, text: 'Կապի խնդիր։' }); } finally { setBusy(false); }
  };

  return (
    <section className="admPrices">
      {!store && <p className="admWarn">Պահոցը դեռ միացված չէ, ուստի փոփոխությունները չեն պահպանվի։ Միացրեք Vercel → Storage → Upstash Redis։</p>}

      <div className="admCard">
        <h3>Վերանորոգում</h3>
        <div className="admGrid3">{TIERS.map((n, i) => <NumField key={n} label={n} value={p.renovation[i]} onChange={v => setTri('renovation', i, v)} />)}</div>
      </div>

      <div className="admCard">
        <h3>Ամբողջական կառուցում (մասնավոր տուն)</h3>
        <NumField label="Կառուցվածք՝ մոնոլիտ, երկշերտ պատեր, տանիք" value={p.shell} onChange={v => up({ shell: v })} />
        <p className="admNote">Տան հարդարման մասը (ավելանում է կառուցվածքին).</p>
        <div className="admGrid3">{TIERS.map((n, i) => <NumField key={n} label={n} value={p.houseFinish[i]} onChange={v => setTri('houseFinish', i, v)} hint={`Կայքում՝ ${fmt(p.shell + p.houseFinish[i])}${i === 2 ? '+' : ''} ֏ / մ²`} />)}</div>
        <div className="admGrid3">
          <NumField label="Մանսարդ հարկ" value={p.mansardPct} onChange={v => up({ mansardPct: v })} suffix="%" />
          <NumField label="Հարթ տանիք" value={p.flatRoofPct} onChange={v => up({ flatRoofPct: v })} suffix="%" />
          <NumField label="Նկուղ" value={p.basement} onChange={v => up({ basement: v })} hint="Նաև «Միայն մոնոլիտ»-ում" />
        </div>
      </div>

      <div className="admCard">
        <h3>Այլ</h3>
        <div className="admGrid3">
          <NumField label="Միայն մոնոլիտ (յուրաքանչյուր հարկ)" value={p.monolith} onChange={v => up({ monolith: v })} />
          <NumField label="Լողավազան (ներքին մակերես)" value={p.pool} onChange={v => up({ pool: v })} />
        </div>
      </div>

      <div className="admCard">
        <h3>Հավելյալ տողեր հաշվիչում</h3>
        <p className="admNote">Այստեղ ավելացրած տողը հաշվիչում կերևա որպես նշելու վանդակ (օրինակ՝ «Ջեռուցման համակարգ»)։ Նշելու դեպքում գինը կավելանա արդյունքին։</p>
        {p.extras.map((x, i) => (
          <div className="admExtra" key={x.id}>
            <div className="admGrid3">
              <label className="admField"><span>Անուն (հայերեն) *</span><div><input value={x.label.hy} onChange={e => setExtra(i, { label: { ...x.label, hy: e.target.value } })} maxLength={80} /></div></label>
              <label className="admField"><span>Անգլերեն</span><div><input value={x.label.en === x.label.hy ? '' : x.label.en} placeholder={x.label.hy} onChange={e => setExtra(i, { label: { ...x.label, en: e.target.value } })} maxLength={80} /></div></label>
              <label className="admField"><span>Ռուսերեն</span><div><input value={x.label.ru === x.label.hy ? '' : x.label.ru} placeholder={x.label.hy} onChange={e => setExtra(i, { label: { ...x.label, ru: e.target.value } })} maxLength={80} /></div></label>
            </div>
            <div className="admExtraRow">
              <div className="admModes">
                {MODES.map(m => (
                  <label key={m}><input type="checkbox" checked={x.modes.includes(m)} onChange={e => setExtra(i, { modes: e.target.checked ? [...x.modes, m] : x.modes.filter(y => y !== m) })} /> {MODE_LABEL[m]}</label>
                ))}
              </div>
              <label className="admField admSmall"><span>Գին</span><div>
                <input type="number" min={0} value={x.value} onChange={e => setExtra(i, { value: Math.max(0, Math.round(Number(e.target.value) || 0)) })} />
                <select value={x.kind} onChange={e => setExtra(i, { kind: e.target.value as Extra['kind'] })}>
                  {(Object.keys(KIND_LABEL) as Extra['kind'][]).map(k => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                </select>
              </div></label>
              <button className="adminCancel" onClick={() => { if (confirm('Ջնջե՞լ այս տողը։')) up({ extras: p.extras.filter((_, j) => j !== i) }); }}>Ջնջել</button>
            </div>
          </div>
        ))}
        <button className="admAdd" onClick={addExtra}>+ Ավելացնել տող</button>
      </div>

      <div className="admSave">
        <button className="button gold" onClick={save} disabled={busy || !dirty}>{busy ? 'Պահպանվում է…' : 'Պահպանել'}</button>
        <button className="adminLogout" onClick={() => { if (confirm('Վերադարձնե՞լ սկզբնական գները։ Հավելյալ տողերը կջնջվեն։ (Պահպանելուց առաջ կարող եք ստուգել)')) up({ ...DEFAULT_PRICING }); }}>Վերադարձնել սկզբնական գները</button>
        {dirty && !msg && <small>Կան չպահպանված փոփոխություններ</small>}
        {msg && <small className={msg.ok ? 'ok' : 'bad'}>{msg.text}</small>}
        {p.updatedAt && !dirty && <small>Վերջին փոփոխությունը՝ {new Date(p.updatedAt).toLocaleString('hy-AM')}</small>}
      </div>
    </section>
  );
}

/* ---------------- Այցելություններ ---------------- */

type Top = { key: string; n: number }[];
type S = { days: { day: string; pv: number; uv: number }[]; totalPv: number; totalUv: number; pages: Top; sources: Top; countries: Top; cities: Top; devices: Top };

const PAGE_NAMES: Record<string, string> = {
  '/': 'Գլխավոր', '/about': 'Մեր մասին', '/services': 'Ծառայություններ', '/services/pools': 'Լողավազաններ', '/services/residential': 'Բնակելի տներ',
  '/services/renovation': 'Վերանորոգում', '/services/public-works': 'Հասարակական շենքեր', '/projects': 'Նախագծեր', '/calculator': 'Հաշվիչ',
  '/contact': 'Կապ', '/booking': 'Գրանցում'
};
const SOURCE_NAMES: Record<string, string> = { direct: 'Ուղիղ մուտք (հղում, էջանիշ, հավելված)', google: 'Google', instagram: 'Instagram', facebook: 'Facebook', yandex: 'Yandex', bing: 'Bing', telegram: 'Telegram', whatsapp: 'WhatsApp', viber: 'Viber' };
const DEVICE_NAMES: Record<string, string> = { mobile: 'Հեռախոս', desktop: 'Համակարգիչ', tablet: 'Պլանշետ' };
let regionNames: Intl.DisplayNames | null = null;
try { regionNames = new Intl.DisplayNames(['hy', 'en'], { type: 'region' }); } catch { regionNames = null; }
const HY_COUNTRY: Record<string, string> = { AM: 'Հայաստան', RU: 'Ռուսաստան', US: 'ԱՄՆ', FR: 'Ֆրանսիա', GE: 'Վրաստան', DE: 'Գերմանիա', UA: 'Ուկրաինա', GB: 'Մեծ Բրիտանիա', IR: 'Իրան', AE: 'ԱՄԷ', CA: 'Կանադա', KZ: 'Ղազախստան', BY: 'Բելառուս', NL: 'Նիդեռլանդներ', IT: 'Իտալիա', ES: 'Իսպանիա', PL: 'Լեհաստան', LB: 'Լիբանան', SY: 'Սիրիա', AR: 'Արգենտինա', AU: 'Ավստրալիա', BE: 'Բելգիա', CZ: 'Չեխիա', GR: 'Հունաստան', TR: 'Թուրքիա', IN: 'Հնդկաստան', CN: 'Չինաստան', IL: 'Իսրայել', SE: 'Շվեդիա', CH: 'Շվեյցարիա', AT: 'Ավստրիա', CY: 'Կիպրոս' };
const country = (c: string) => { if (!c || c === '??') return 'Անհայտ'; if (HY_COUNTRY[c]) return HY_COUNTRY[c]; try { return regionNames?.of(c) || c; } catch { return c; } };
const pageName = (p: string) => PAGE_NAMES[p] || (p.startsWith('/projects/') ? `Նախագիծ՝ ${p.split('/').pop()}` : p);

function TopList({ title, rows, name }: { title: string; rows: Top; name: (k: string) => string }) {
  const max = Math.max(1, ...rows.map(r => r.n));
  return (
    <div className="admCard">
      <h3>{title}</h3>
      {!rows.length && <p className="adminEmpty">Տվյալներ դեռ չկան</p>}
      <ul className="admTop">{rows.map(r => <li key={r.key}><span>{name(r.key)}</span><b>{r.n}</b><i style={{ width: `${(r.n / max) * 100}%` }} /></li>)}</ul>
    </div>
  );
}

function Stats({ api }: { api: Api }) {
  const [days, setDays] = useState(7);
  const [s, setS] = useState<S | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    setErr('');
    api<{ stats: S }>(`/api/admin/stats?days=${days}`).then(r => { if (r.ok) setS(r.data.stats); else setErr(errText(r.data.error)); }).catch(() => setErr('Կապի խնդիր։'));
  }, [api, days]);
  const max = Math.max(1, ...(s?.days.map(d => d.pv) || [1]));

  return (
    <section>
      <div className="adminBar">
        <h2>Այցելություններ</h2>
        <div className="adminTools admPeriods">
          {[[1, 'Այսօր'], [7, '7 օր'], [30, '30 օր'], [90, '90 օր']].map(([d, l]) => <button key={d} className={days === d ? 'on' : ''} onClick={() => setDays(d as number)}>{l}</button>)}
        </div>
      </div>
      {err && <em className="adminErr">{err}</em>}
      {s && (
        <>
          <div className="admTiles">
            <div><b>{s.totalUv.toLocaleString('en-US')}</b><span>Այցելու (եզակի)</span></div>
            <div><b>{s.totalPv.toLocaleString('en-US')}</b><span>Էջի դիտում</span></div>
            <div><b>{s.totalUv ? (s.totalPv / s.totalUv).toFixed(1) : '0'}</b><span>Էջ մեկ այցելուին</span></div>
          </div>
          {s.days.length > 1 && (
            <div className="admCard">
              <h3>Ըստ օրերի</h3>
              <div className="admChart">
                {s.days.map(d => (
                  <div key={d.day} title={`${d.day}: ${d.uv} այցելու, ${d.pv} դիտում`}>
                    <i style={{ height: `${(d.pv / max) * 100}%` }}><em style={{ height: `${d.pv ? (d.uv / d.pv) * 100 : 0}%` }} /></i>
                    {s.days.length <= 31 && <small>{Number(d.day.slice(8))}</small>}
                  </div>
                ))}
              </div>
              <p className="admLegend"><span className="pv" /> դիտումներ <span className="uv" /> այցելուներ</p>
            </div>
          )}
          <div className="admGrid2">
            <TopList title="Որտեղից են եկել" rows={s.sources} name={k => SOURCE_NAMES[k] || k} />
            <TopList title="Երկրներ" rows={s.countries} name={country} />
            <TopList title="Քաղաքներ" rows={s.cities} name={k => { const [c, cc] = k.split(', '); return cc ? `${c} (${country(cc)})` : country(k); }} />
            <TopList title="Սարքեր" rows={s.devices} name={k => DEVICE_NAMES[k] || k} />
          </div>
          <TopList title="Ամենաշատ դիտված էջերը" rows={s.pages} name={pageName} />
          <p className="admNote">Հաշվարկը սկսվում է այն պահից, երբ պահոցը միացված է։ Բոտերը և ձեր ադմին էջը չեն հաշվվում։ Անձնական տվյալներ (IP հասցե) չեն պահվում։</p>
        </>
      )}
      {!s && !err && <p className="adminEmpty">Բեռնվում է…</p>}
    </section>
  );
}
