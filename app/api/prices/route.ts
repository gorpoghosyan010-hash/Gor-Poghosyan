import { NextResponse } from 'next/server';
import { kv, storeConfigured } from '../../../lib/kv';
import { DEFAULT_PRICING, normalizePricing } from '../../../lib/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  let pricing = DEFAULT_PRICING;
  if (storeConfigured) {
    try {
      const [r] = await kv([['GET', 'config:prices']]);
      if (typeof r?.result === 'string') pricing = normalizePricing(JSON.parse(r.result));
    } catch (e) { console.error('prices', e); }
  }
  return NextResponse.json(pricing, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' } });
}
