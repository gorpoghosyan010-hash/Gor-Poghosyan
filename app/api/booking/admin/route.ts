import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { listBookings, getBooking, cancelBooking, storeConfigured } from '../../../../lib/bookingStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const h = (s: string) => createHash('sha256').update(s).digest();
function authorized(req: Request) {
  const pw = process.env.BOOKING_ADMIN_PASSWORD || '';
  const given = req.headers.get('x-admin-password') || '';
  return Boolean(pw) && timingSafeEqual(h(pw), h(given));
}
const deny = () => NextResponse.json({ ok: false, error: process.env.BOOKING_ADMIN_PASSWORD ? 'unauthorized' : 'no_password' }, { status: 401 });

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
