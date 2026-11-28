import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getBooking, cancelBooking } from '../../../../lib/bookingStore';
import { notifyOwner, hyDate, originOf } from '../../../../lib/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

async function load(id: string, t: string) {
  const b = await getBooking(id);
  return b && t && same(b.token, t) ? b : null;
}

// Պատվիրատուի չեղարկման հղումը՝ ?id=...&t=...
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  try {
    const b = await load(q.get('id') || '', q.get('t') || '');
    if (!b) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, date: b.date, hour: b.hour, name: b.name, status: b.status });
  } catch (e) { console.error(e); return NextResponse.json({ ok: false, error: 'store' }, { status: 503 }); }
}

export async function POST(req: Request) {
  let body: { id?: string; t?: string } = {};
  try { body = await req.json(); } catch { /* empty */ }
  try {
    const b = await load(String(body.id || ''), String(body.t || ''));
    if (!b) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    if (b.status === 'cancelled') return NextResponse.json({ ok: true, already: true });
    await cancelBooking(b, 'client');
    await notifyOwner('Գրանցումը չեղարկվել է (պատվիրատուի կողմից)', [
      `Օր՝ ${hyDate(b.date)} (${b.date})`, `Ժամ՝ ${String(b.hour).padStart(2, '0')}:00`, `Անուն՝ ${b.name}`, `Հեռախոս՝ ${b.phone}`, 'Ժամն այժմ ազատ է։'
    ], { subject: `Չեղարկում — ${hyDate(b.date)}, ${b.hour}:00 — ${b.name}`, link: { text: 'Բոլոր գրանցումները', url: `${originOf(req)}/admin` } });
    return NextResponse.json({ ok: true });
  } catch (e) { console.error(e); return NextResponse.json({ ok: false, error: 'store' }, { status: 503 }); }
}
