import { NextResponse } from 'next/server';
import { kv, storeConfigured } from '../../../../lib/kv';
import { isAdmin, denyAdmin } from '../../../../lib/adminAuth';
import { DEFAULT_PRICING, normalizePricing } from '../../../../lib/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAdmin(req)) return denyAdmin();
  if (!storeConfigured) return NextResponse.json({ ok: true, pricing: DEFAULT_PRICING, defaults: DEFAULT_PRICING, store: false });
  try {
    const [r] = await kv([['GET', 'config:prices']]);
    const pricing = typeof r?.result === 'string' ? normalizePricing(JSON.parse(r.result)) : DEFAULT_PRICING;
    return NextResponse.json({ ok: true, pricing, defaults: DEFAULT_PRICING, store: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { console.error(e); return NextResponse.json({ ok: false, error: 'store' }, { status: 503 }); }
}

export async function PUT(req: Request) {
  if (!isAdmin(req)) return denyAdmin();
  if (!storeConfigured) return NextResponse.json({ ok: false, error: 'no_store' }, { status: 503 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 }); }
  const pricing = { ...normalizePricing(body), updatedAt: new Date().toISOString() };
  try {
    // Նախորդ տարբերակը պահում ենք, որ սխալի դեպքում հնարավոր լինի վերականգնել
    await kv([['GET', 'config:prices'], ['SET', 'config:prices', JSON.stringify(pricing)]]).then(async ([prev]) => {
      if (typeof prev?.result === 'string') await kv([['LPUSH', 'config:prices:history', prev.result], ['LTRIM', 'config:prices:history', 0, 19]]);
    });
    return NextResponse.json({ ok: true, pricing });
  } catch (e) { console.error(e); return NextResponse.json({ ok: false, error: 'store' }, { status: 503 }); }
}
