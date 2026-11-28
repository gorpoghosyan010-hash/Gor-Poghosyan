import { NextResponse } from 'next/server';
import { isAdmin as authorized, denyAdmin as deny } from '../../../../lib/adminAuth';
import { listBookings, getBooking, cancelBooking, storeConfigured } from '../../../../lib/bookingStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!authorized(req)) return deny();
  if (!storeConfigured) return NextResponse.json({ ok: false, error: 'no_store' }, { status: 503 });
  try {
    const list = (await listBookings()).map(({ token: _t, ...b }) => b);
    return NextResponse.json({ ok: true, bookings: list }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { console.error(e); return NextResponse.json({ ok: false, error: 'store' }, { status: 503 }); }
}

export async function POST(req: Request) {
  if (!authorized(req)) return deny();
  let body: { id?: string } = {};
  try { body = await req.json(); } catch { /* empty */ }
  try {
    const b = await getBooking(String(body.id || ''));
    if (!b) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    if (b.status !== 'cancelled') await cancelBooking(b, 'admin');
    return NextResponse.json({ ok: true });
  } catch (e) { console.error(e); return NextResponse.json({ ok: false, error: 'store' }, { status: 503 }); }
}
