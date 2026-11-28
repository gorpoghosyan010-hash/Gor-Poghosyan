import { NextResponse } from 'next/server';
import { storeConfigured } from '../../../../lib/kv';
import { isAdmin, denyAdmin } from '../../../../lib/adminAuth';
import { readStats } from '../../../../lib/stats';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAdmin(req)) return denyAdmin();
  if (!storeConfigured) return NextResponse.json({ ok: false, error: 'no_store' }, { status: 503 });
  const d = Number(new URL(req.url).searchParams.get('days'));
  const days = [1, 7, 30, 90].includes(d) ? d : 7;
  try {
    return NextResponse.json({ ok: true, stats: await readStats(days) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { console.error(e); return NextResponse.json({ ok: false, error: 'store' }, { status: 503 }); }
}
