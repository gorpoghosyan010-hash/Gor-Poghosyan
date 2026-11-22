import { NextResponse } from 'next/server';

// Տեղազննության գրանցում. ծանուցումը գնում է Telegram-ով և/կամ էլ. փոստով (Resend)։
// Կարգավորումը՝ Vercel → Settings → Environment Variables.
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID       — Telegram
//   RESEND_API_KEY, BOOKING_EMAIL_TO (ըստ ցանկ.) — էլ. փոստ
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 }); }
  if (clip(body.website, 200)) return NextResponse.json({ ok: true }); // spam trap

  const name = clip(body.name, 120), phone = clip(body.phone, 40), email = clip(body.email, 120);
  const address = clip(body.address, 300), note = clip(body.note, 1500), lang = clip(body.lang, 4);
  const date = clip(body.date, 10), time = clip(body.time, 5), dateLabel = clip(body.dateLabel, 60);
  if (!name || !phone || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  const lines = [
    `Նոր գրանցում՝ տեղազննություն`,
    `Օր՝ ${dateLabel || date} (${date})`,
    `Ժամ՝ ${time}`,
    `Անուն՝ ${name}`,
    `Հեռախոս՝ ${phone}`,
    email && `Էլ. փոստ՝ ${email}`,
    address && `Հասցե՝ ${address}`,
    note && `Նշում՝ ${note}`,
    lang && `Կայքի լեզու՝ ${lang}`
  ].filter(Boolean) as string[];

  const sent: string[] = [];
  const tgToken = process.env.TELEGRAM_BOT_TOKEN, tgChat = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChat) {
    try {
      const html = `<b>${esc(lines[0])}</b>\n` + lines.slice(1).map(esc).join('\n');
      const chats = tgChat.split(',').map(s => s.trim()).filter(Boolean);
      const results = await Promise.all(chats.map(chat_id => fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text: html, parse_mode: 'HTML' })
      })));
      if (results.some(r => r.ok)) sent.push('telegram'); else console.error('telegram', results.map(r => r.status));
    } catch (e) { console.error('telegram', e); }
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: process.env.BOOKING_EMAIL_FROM || 'GARON <onboarding@resend.dev>',
          to: (process.env.BOOKING_EMAIL_TO || 'info@garon.am').split(',').map(s => s.trim()),
          ...(email ? { reply_to: email } : {}),
          subject: `Տեղազննություն — ${dateLabel || date}, ${time} — ${name}`,
          text: lines.join('\n')
        })
      });
      if (r.ok) sent.push('email'); else console.error('resend', r.status, await r.text());
    } catch (e) { console.error('resend', e); }
  }

  if (!sent.length) return NextResponse.json({ ok: false, error: 'not_delivered' }, { status: 503 });
  return NextResponse.json({ ok: true, sent });
}
