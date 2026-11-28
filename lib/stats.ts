// Այցելությունների պարզ հաշվառում՝ առանց cookie-ների և առանց IP հասցեներ պահելու։
// Եզակի այցելուն որոշվում է IP+բրաուզեր+օր-ի գաղտնի հեշով (HyperLogLog), որը հնարավոր չէ հետ վերծանել։
import { createHash } from 'crypto';
import { kv } from './kv';

const TTL = 60 * 60 * 24 * 400;
// Երևանի օրը (UTC+4)
export const dayOf = (t = Date.now()) => new Date(t + 4 * 3600e3).toISOString().slice(0, 10);
const k = (name: string, d: string) => `st:${name}:${d}`;

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|monitor|curl|wget|python|axios|node-fetch|vercel/i;
export const isBot = (ua: string) => !ua || BOT.test(ua);

export function sourceOf(referrer: string, utm: string, ownHost: string): string {
  if (utm) return utm.toLowerCase().slice(0, 40);
  if (!referrer) return 'direct';
  try {
    const h = new URL(referrer).hostname.replace(/^www\./, '').replace(/^m\./, '').replace(/^l\./, '').replace(/^lm\./, '');
    if (!h || h === ownHost.replace(/^www\./, '')) return 'direct';
    if (/google\./.test(h)) return 'google';
    if (/instagram\.com$/.test(h)) return 'instagram';
    if (/facebook\.com$|fb\.com$/.test(h)) return 'facebook';
    if (/yandex\./.test(h)) return 'yandex';
    if (/bing\.com$/.test(h)) return 'bing';
    if (/t\.me$|telegram/.test(h)) return 'telegram';
    if (/whatsapp/.test(h)) return 'whatsapp';
    if (/viber/.test(h)) return 'viber';
    if (/list\.am$/.test(h)) return 'list.am';
    return h.slice(0, 60);
  } catch { return 'direct'; }
}

export function deviceOf(ua: string) {
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  if (/mobi|iphone|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

export async function record(v: { path: string; source: string; country: string; city: string; device: string; ip: string; ua: string }) {
  const d = dayOf();
  const salt = process.env.STATS_SALT || process.env.KV_REST_API_TOKEN || 'garon';
  const visitor = createHash('sha256').update(`${salt}|${d}|${v.ip}|${v.ua}`).digest('hex').slice(0, 24);
  const place = v.city ? `${v.city}, ${v.country}` : v.country;
  const cmds: (string | number)[][] = [
    ['INCR', k('pv', d)],
    ['PFADD', k('uv', d), visitor],
    ['HINCRBY', k('pg', d), v.path, 1],
    ['HINCRBY', k('src', d), v.source, 1],
    ['HINCRBY', k('ctry', d), v.country || '??', 1],
    ['HINCRBY', k('city', d), place || '??', 1],
    ['HINCRBY', k('dev', d), v.device, 1]
  ];
  // Աղբյուրը և երկիրը հաշվում ենք մեկ անգամ յուրաքանչյուր այցելուի համար (օրական)
  const [first] = await kv([['SET', `st:seen:${d}:${visitor}`, 1, 'NX', 'EX', 60 * 60 * 26]]);
  if (first?.result === 'OK') {
    cmds.push(['HINCRBY', k('vsrc', d), v.source, 1], ['HINCRBY', k('vctry', d), v.country || '??', 1], ['HINCRBY', k('vcity', d), place || '??', 1], ['HINCRBY', k('vdev', d), v.device, 1]);
  }
  for (const n of ['pv', 'uv', 'pg', 'src', 'ctry', 'city', 'dev', 'vsrc', 'vctry', 'vcity', 'vdev']) cmds.push(['EXPIRE', k(n, d), TTL]);
  await kv(cmds);
}

type Top = { key: string; n: number }[];
export type Stats = {
  days: { day: string; pv: number; uv: number }[];
  totalPv: number; totalUv: number;
  pages: Top; sources: Top; countries: Top; cities: Top; devices: Top;
};

const pairs = (v: unknown): [string, number][] => {
  const a = Array.isArray(v) ? v as string[] : [];
  const out: [string, number][] = [];
  for (let i = 0; i + 1 < a.length; i += 2) out.push([a[i], Number(a[i + 1]) || 0]);
  return out;
};

export async function readStats(nDays: number): Promise<Stats> {
  const days: string[] = [];
  for (let i = nDays - 1; i >= 0; i--) days.push(dayOf(Date.now() - i * 864e5));
  const hashes = ['pg', 'vsrc', 'vctry', 'vcity', 'vdev'];
  const cmds: (string | number)[][] = [];
  for (const d of days) cmds.push(['GET', k('pv', d)], ['PFCOUNT', k('uv', d)]);
  cmds.push(['PFCOUNT', ...days.map(d => k('uv', d))]);
  for (const h of hashes) for (const d of days) cmds.push(['HGETALL', k(h, d)]);
  const res = await kv(cmds);
  const perDay = days.map((day, i) => ({ day, pv: Number(res[i * 2]?.result) || 0, uv: Number(res[i * 2 + 1]?.result) || 0 }));
  const totalUv = Number(res[days.length * 2]?.result) || 0;
  let idx = days.length * 2 + 1;
  const agg: Record<string, Map<string, number>> = {};
  for (const h of hashes) {
    const m = new Map<string, number>();
    for (let i = 0; i < days.length; i++) for (const [key, n] of pairs(res[idx++]?.result)) m.set(key, (m.get(key) || 0) + n);
    agg[h] = m;
  }
  const top = (m: Map<string, number>, n = 12): Top => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([key, n]) => ({ key, n }));
  return {
    days: perDay,
    totalPv: perDay.reduce((s, x) => s + x.pv, 0),
    totalUv,
    pages: top(agg.pg), sources: top(agg.vsrc), countries: top(agg.vctry), cities: top(agg.vcity), devices: top(agg.vdev)
  };
}
