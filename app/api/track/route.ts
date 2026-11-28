import { NextResponse } from 'next/server';
import { storeConfigured } from '../../../lib/kv';
import { record, isBot, sourceOf, deviceOf } from '../../../lib/stats';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PATH_RE = /^\/[a-z0-9/_-]{0,80}$/i;

export async function POST(req: Request) {
  if (!storeConfigured) return new NextResponse(null, { status: 204 });
  const ua = req.headers.get('user-agent') || '';
  if (isBot(ua)) return new NextResponse(null, { status: 204 });
  let b: Record<string, unknown> = {};
  try { b = JSON.parse(await req.text()); } catch { return new NextResponse(null, { status: 204 }); }
  const path = typeof b.p === 'string' && PATH_RE.test(b.p) ? b.p.replace(/\/+$/, '') || '/' : '';
  if (!path || path.startsWith('/admin') || path.startsWith('/booking/admin') || path.startsWith('/booking/cancel')) return new NextResponse(null, { status: 204 });
  const h = req.headers;
  const host = h.get('x-forwarded-host') || h.get('host') || '';
  let city = h.get('x-vercel-ip-city') || '';
  try { city = decodeURIComponent(city); } catch { /* keep */ }
  try {
    await record({
      path,
      source: sourceOf(typeof b.r === 'string' ? b.r : '', typeof b.s === 'string' ? b.s.replace(/[^\w.-]/g, '') : '', host),
      country: (h.get('x-vercel-ip-country') || '').slice(0, 2).toUpperCase(),
      city: city.slice(0, 40),
      device: deviceOf(ua),
      ip: (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || '',
      ua
    });
  } catch (e) { console.error('track', e); }
  return new NextResponse(null, { status: 204 });
}
