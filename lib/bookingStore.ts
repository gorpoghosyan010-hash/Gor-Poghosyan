// Ամրագրված ժամերի պահոց (Upstash Redis, REST API)։
// Vercel → Storage → Upstash Redis միացնելիս փոփոխականներն ավելանում են ինքնաշխատ։
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const storeConfigured = Boolean(URL_ && TOKEN);

// Այցերի միջև նվազագույն տարբերությունը (ժամ)
export const MIN_GAP_HOURS = 4;
export const HOURS = [10, 11, 12, 13, 14, 15, 16, 17];

const key = (date: string) => `booking:${date}`;

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
  const res = await pipeline(dates.map(d => ['SMEMBERS', key(d)]));
  dates.forEach((d, i) => {
    const v = (res[i]?.result as string[] | undefined) || [];
    const hrs = v.map(Number).filter(n => Number.isFinite(n));
    if (hrs.length) out[d] = hrs.sort((a, b) => a - b);
  });
  return out;
}

export const isFree = (hour: number, booked: number[]) => booked.every(b => Math.abs(b - hour) >= MIN_GAP_HOURS);

export async function addBooking(date: string, hour: number) {
  if (!storeConfigured) return;
  await pipeline([['SADD', key(date), String(hour)], ['EXPIRE', key(date), 60 * 60 * 24 * 90]]);
}
