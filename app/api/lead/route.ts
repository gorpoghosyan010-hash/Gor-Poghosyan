// Կապի ձևի հայտերի ընդունում → Telegram bot և/կամ email (Resend)։
// Միացվում է Vercel-ի Environment Variables-ով (տես README). եթե ոչինչ լրացված չէ,
// պատասխանում է 503 { fallback: 'mailto' }, և ձևը բացում է այցելուի էլ. փոստի ծրագիրը (ինչպես նախկինում)։
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };
const hits = new Map<string, number[]>(); // պարզ rate limit՝ մեկ սերվերի հիշողության մեջ (մեկ IP՝ 5 հայտ / 10 րոպե)

function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter(t => now - t < LIMIT.windowMs);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < LIMIT.windowMs)) hits.delete(k);
  return list.length > LIMIT.max;
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

type Lead = { name: string; phone: string; email: string; type: string; project: string; budget: string; plot: string; message: string; page: string; lang: string };

function validate(body: Record<string, unknown>): { lead?: Lead; fields?: Record<string, string> } {
  const lead: Lead = {
    name: str(body.name, 100),
    phone: str(body.phone, 40),
    email: str(body.email, 200),
    type: str(body.type, 100),
    project: str(body.project, 150),
    budget: str(body.budget, 60),
    plot: str(body.plot, 60),
    message: str(body.message, 3000),
    page: str(body.page, 300),
    lang: str(body.lang, 5)
  };
  const fields: Record<string, string> = {};
  if (lead.name.length < 2) fields.name = 'required';
  const digits = lead.phone.replace(/\D/g, '');
  if (!lead.phone) fields.phone = 'required';
  else if (!/^[\d\s+()\-.]+$/.test(lead.phone) || digits.length < 6 || digits.length > 15) fields.phone = 'invalid';
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) fields.email = 'invalid';
  return Object.keys(fields).length ? { fields } : { lead };
}

function format(l: Lead) {
  return [
    'Նոր հայտ garon.am-ից',
    `Անուն: ${l.name}`,
    `Հեռախոս: ${l.phone}`,
    l.email && `Email: ${l.email}`,
    l.type && `Տեսակ: ${l.type}`,
    l.project && `Նախագիծ: ${l.project}`,
    l.budget && `Բյուջե: ${l.budget}`,
    l.plot && `Հողակտոր: ${l.plot}`,
    l.message && `\n${l.message}`,
    (l.page || l.lang) && `\n— ${[l.page, l.lang].filter(Boolean).join(' · ')}`
  ].filter(Boolean).join('\n');
}

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return null;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) throw new Error(`telegram ${res.status}`);
  return 'telegram';
}

async function sendEmail(l: Lead, text: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_EMAIL;
  if (!key || !to) return null;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: process.env.LEADS_FROM || 'GARON Website <onboarding@resend.dev>',
      to: to.split(',').map(s => s.trim()).filter(Boolean),
      subject: `GARON — նոր հայտ: ${l.name}${l.type ? ` (${l.type})` : ''}`,
      text,
      ...(l.email ? { reply_to: l.email } : {})
    }),
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
  return 'email';
}

export async function POST(req: Request) {
  const configured = Boolean((process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) || (process.env.RESEND_API_KEY && process.env.LEADS_EMAIL));

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('bad body');
    body = parsed;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  // Honeypot՝ մարդը այս դաշտը չի տեսնում. լրացված է → բոտ (պատասխանում ենք «ok», բայց ոչինչ չենք ուղարկում)
  if (str(body.website, 200)) return NextResponse.json({ ok: true });

  const { lead, fields } = validate(body);
  if (!lead) return NextResponse.json({ ok: false, error: 'validation', fields }, { status: 400 });

  if (!configured) return NextResponse.json({ ok: false, error: 'not_configured', fallback: 'mailto' }, { status: 503 });

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  const text = format(lead);
  const results = await Promise.allSettled([sendTelegram(text), sendEmail(lead, text)]);
  const delivered = results.flatMap(r => (r.status === 'fulfilled' && r.value ? [r.value] : []));
  results.forEach(r => { if (r.status === 'rejected') console.error('[lead] delivery failed:', (r.reason as Error).message); });
  if (!delivered.length) return NextResponse.json({ ok: false, error: 'delivery_failed', fallback: 'mailto' }, { status: 502 });
  return NextResponse.json({ ok: true, delivered });
}
