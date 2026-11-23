// Ծանուցումներ՝ Telegram (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) և էլ. փոստ (RESEND_API_KEY)։
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function notifyOwner(title: string, lines: string[], opts: { replyTo?: string; subject: string; link?: { text: string; url: string } }) {
  const sent: string[] = [];
  const tgToken = process.env.TELEGRAM_BOT_TOKEN, tgChat = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChat) {
    try {
      let html = `<b>${esc(title)}</b>\n` + lines.map(esc).join('\n');
      if (opts.link) html += `\n\n<a href="${esc(opts.link.url)}">${esc(opts.link.text)}</a>`;
      const chats = tgChat.split(',').map(s => s.trim()).filter(Boolean);
      const results = await Promise.all(chats.map(chat_id => fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text: html, parse_mode: 'HTML', disable_web_page_preview: true })
      })));
      if (results.some(r => r.ok)) sent.push('telegram'); else console.error('telegram', results.map(r => r.status));
    } catch (e) { console.error('telegram', e); }
  }
  const text = [title, ...lines, opts.link ? `\n${opts.link.text}: ${opts.link.url}` : ''].join('\n');
  if (await sendEmail((process.env.BOOKING_EMAIL_TO || 'info@garon.am').split(',').map(s => s.trim()), opts.subject, text, opts.replyTo)) sent.push('email');
  return sent;
}

export async function sendEmail(to: string[], subject: string, text: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: process.env.BOOKING_EMAIL_FROM || 'GARON <onboarding@resend.dev>', to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) })
    });
    if (!r.ok) console.error('resend', r.status, await r.text());
    return r.ok;
  } catch (e) { console.error('resend', e); return false; }
}

// Պատվիրատուին նամակ ուղարկել հնարավոր է միայն Resend-ում garon.am դոմենը հաստատելուց հետո (BOOKING_EMAIL_FROM)
export const canEmailClients = () => Boolean(process.env.RESEND_API_KEY && process.env.BOOKING_EMAIL_FROM);

export function originOf(req: Request) {
  const h = req.headers;
  const host = h.get('x-forwarded-host') || h.get('host') || 'garon.am';
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
}

export const HY_WEEK = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ'];
export const HY_MONTH = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'];
export function hyDate(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  return `${HY_WEEK[d.getUTCDay()]}, ${d.getUTCDate()} ${HY_MONTH[d.getUTCMonth()]}`;
}
