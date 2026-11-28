// Upstash Redis (REST)։ Vercel → Storage → Upstash Redis միացնելիս փոփոխականներն ավելանում են ինքնաշխատ։
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const storeConfigured = Boolean(URL_ && TOKEN);

export type KvResult = { result?: unknown; error?: string };

export async function kv(cmds: (string | number)[][]): Promise<KvResult[]> {
  if (!storeConfigured) throw new Error('store not configured');
  const r = await fetch(`${URL_}/pipeline`, {
    method: 'POST', cache: 'no-store',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds)
  });
  if (!r.ok) throw new Error(`store ${r.status}`);
  return r.json();
}
