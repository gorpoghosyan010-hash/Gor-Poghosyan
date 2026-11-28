import { NextResponse } from 'next/server';
import { bookedHours, isFree, HOURS, storeConfigured, newBooking, saveBooking } from '../../../lib/bookingStore';
import { notifyOwner, sendEmail, canEmailClients, originOf, hyDate } from '../../../lib/notify';

// Այցելության և չափագրման գրանցում։
// Կարգավորումը՝ Vercel → Settings → Environment Variables.
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID          — Telegram
//   RESEND_API_KEY, BOOKING_EMAIL_TO (ըստ ցանկ.)   — էլ. փոստ
//   KV_REST_API_URL, KV_REST_API_TOKEN             — գրանցումների պահոց (Upstash Redis)
//   ADMIN_PASSWORD (կամ BOOKING_ADMIN_PASSWORD)    — /admin էջի գաղտնաբառը
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Զբաղված ժամերը՝ ?dates=2026-11-24,2026-11-25,...
export async function GET(req: Request) {
  const dates = (new URL(req.url).searchParams.get('dates') || '').split(',').filter(d => DATE_RE.test(d)).slice(0, 40);
  try {
    return NextResponse.json({ configured: storeConfigured, booked: await bookedHours(dates) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('store', e);
    return NextResponse.json({ configured: storeConfigured, booked: {}, error: 'store' }, { headers: { 'Cache-Control': 'no-store' } });
  }
}

const CLIENT_MAIL = {
  hy: { s: 'Ձեր գրանցումը՝ GARON Construction', a: 'Շնորհակալություն։ Ձեր այցելության և չափագրման հայտը ստացվել է։', d: 'Օր և ժամ', c: 'Եթե ցանկանում եք չեղարկել գրանցումը, բացեք այս հղումը' },
  en: { s: 'Your booking — GARON Construction', a: 'Thank you! Your visit and measurement request has been received.', d: 'Day and time', c: 'To cancel your booking, open this link' },
  ru: { s: 'Ваша запись — GARON Construction', a: 'Спасибо! Ваша заявка на выезд и замер получена.', d: 'День и время', c: 'Чтобы отменить запись, откройте эту ссылку' }
};

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 }); }
  if (clip(body.website, 200)) return NextResponse.json({ ok: true }); // spam trap

  const name = clip(body.name, 120), phone = clip(body.phone, 40), email = clip(body.email, 120);
  const address = clip(body.address, 300), note = clip(body.note, 1500);
  const lang = (['hy', 'en', 'ru'].includes(clip(body.lang, 4)) ? clip(body.lang, 4) : 'hy') as 'hy' | 'en' | 'ru';
  const date = clip(body.date, 10), time = clip(body.time, 5), dateLabel = clip(body.dateLabel, 60);
  if (!name || !phone || !DATE_RE.test(date) || !/^\d{2}:00$/.test(time)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }
  const hour = Number(time.slice(0, 2));
  if (!HOURS.includes(hour) || new Date(`${date}T12:00:00Z`).getUTCDay() === 0) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }
  if (storeConfigured) {
    try {
      const booked = (await bookedHours([date]))[date] || [];
      if (!isFree(hour, booked)) return NextResponse.json({ ok: false, error: 'taken' }, { status: 409 });
    } catch (e) { console.error('store', e); }
  }

  const b = newBooking({ date, hour, name, phone, email, address, note, lang });
  const origin = originOf(req);
  const lines = [
    `Օր՝ ${hyDate(date)} (${date})`, `Ժամ՝ ${time}`, `Անուն՝ ${name}`, `Հեռախոս՝ ${phone}`,
    email && `Էլ. փոստ՝ ${email}`, address && `Հասցե՝ ${address}`, note && `Նշում՝ ${note}`, `Կայքի լեզու՝ ${lang}`
  ].filter(Boolean) as string[];
  const sent = await notifyOwner('Նոր գրանցում՝ այցելություն և չափագրում', lines, {
    replyTo: email || undefined,
    subject: `Այցելություն և չափագրում — ${hyDate(date)}, ${time} — ${name}`,
    link: storeConfigured ? { text: 'Բոլոր գրանցումները', url: `${origin}/admin` } : undefined
  });
  if (!sent.length) return NextResponse.json({ ok: false, error: 'not_delivered' }, { status: 503 });

  let saved = false;
  try { await saveBooking(b); saved = storeConfigured; } catch (e) { console.error('store', e); }
  const cancelUrl = saved ? `${origin}/booking/cancel?id=${b.id}&t=${b.token}` : '';

  if (saved && email && canEmailClients()) {
    const m = CLIENT_MAIL[lang];
    await sendEmail([email], m.s, `${m.a}\n\n${m.d}: ${dateLabel || date}, ${time}\n\n${m.c}:\n${cancelUrl}\n\nGARON Construction`);
  }
  return NextResponse.json({ ok: true, sent, cancelUrl });
}
