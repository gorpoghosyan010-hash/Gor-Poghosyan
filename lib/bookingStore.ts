// Գրանցումների պահոց (Upstash Redis, REST API)։
// Vercel → Storage → Upstash Redis միացնելիս փոփոխականներն ավելանում են ինքնաշխատ։
import { randomBytes } from 'crypto';

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const storeConfigured = Boolean(URL_ && TOKEN);

// Այցերի միջև նվազագույն տարբերությունը (ժամ)
export const MIN_GAP_HOURS = 4;
export const HOURS = [10, 11, 12, 13, 14, 15, 16, 17];
const TTL = 60 * 60 * 24 * 120;

export type Booking = {
  id: string; token: string; date: string; hour: number;
  name: string; phone: string; email: string; address: string; note: string; lang: string;
  createdAt: string; status: 'active' | 'cancelled'; cancelledAt?: string; cancelledBy?: 'client' | 'admin';
};

const slotsKey = (date: string) => `booking:${date}`;
const recKey = (id: string) => `bk:${id}`;
const INDEX = 'bk:index';
// Երևան՝ UTC+4
const slotTime = (date: string, hour: number) => Date.parse(`${date}T${String(hour).padStart(2, '0')}:00:00+04:00`);

async function pipeline(cmds: (string | number)[][]): Promise<{ result?: unknown; error?: string }[]> {
  const r = await fetch(`${URL_}/pipeline`, {
    method: 'POST', cache: 'no-store',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds)
  });
  if (!r.ok) throw new Error(`store ${r.status}`);
  return r.json();
}

export async function bookedHours(dates: string[]): Promise<Record<string, number[]>> {
  const out: Record<string, number[]> = {};
  if (!storeConfigured || !dates.length) return out;
  const res = await pipeline(dates.map(d => ['SMEMBERS', slotsKey(d)]));
  dates.forEach((d, i) => {
    const v = (res[i]?.result as string[] | undefined) || [];
    const hrs = v.map(Number).filter(n => Number.isFinite(n));
    if (hrs.length) out[d] = hrs.sort((a, b) => a - b);
  });
  return out;
}

export const isFree = (hour: number, booked: number[]) => booked.every(b => Math.abs(b - hour) >= MIN_GAP_HOURS);

export function newBooking(data: Omit<Booking, 'id' | 'token' | 'createdAt' | 'status'>): Booking {
  return { ...data, id: randomBytes(6).toString('hex'), token: randomBytes(18).toString('hex'), createdAt: new Date().toISOString(), status: 'active' };
}

export async function saveBooking(b: Booking) {
  if (!storeConfigured) return;
  await pipeline([
    ['SADD', slotsKey(b.date), String(b.hour)], ['EXPIRE', slotsKey(b.date), TTL],
    ['SET', recKey(b.id), JSON.stringify(b), 'EX', TTL],
    ['ZADD', INDEX, slotTime(b.date, b.hour), b.id]
  ]);
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (!storeConfigured || !/^[a-f0-9]{12}$/.test(id)) return null;
  const [r] = await pipeline([['GET', recKey(id)]]);
  return typeof r?.result === 'string' ? JSON.parse(r.result) : null;
}

export async function cancelBooking(b: Booking, by: 'client' | 'admin'): Promise<Booking> {
  const next: Booking = { ...b, status: 'cancelled', cancelledAt: new Date().toISOString(), cancelledBy: by };
  await pipeline([
    ['SREM', slotsKey(b.date), String(b.hour)],
    ['SET', recKey(b.id), JSON.stringify(next), 'EX', TTL]
  ]);
  return next;
}

// Գրանցումները՝ սկսած երեկվանից
export async function listBookings(): Promise<Booking[]> {
  if (!storeConfigured) return [];
  const [r] = await pipeline([['ZRANGEBYSCORE', INDEX, Date.now() - 864e5, '+inf']]);
  const ids = (r?.result as string[] | undefined) || [];
  if (!ids.length) return [];
  const recs = await pipeline(ids.map(id => ['GET', recKey(id)]));
  return recs.map(x => (typeof x.result === 'string' ? JSON.parse(x.result) as Booking : null)).filter((x): x is Booking => !!x);
}
