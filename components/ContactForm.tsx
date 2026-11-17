'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { contact } from '../content/i18n';
import { siteConfig, contactLinks } from '../content/siteConfig';

// Ձևը ուղարկում է հայտը /api/lead (→ Telegram և/կամ email)։ Եթե սերվերում ոչինչ միացված չէ
// (503 + fallback: 'mailto'), բացվում է այցելուի էլ. փոստի ծրագիրը՝ պատրաստի նամակով։
// Անուն/email/հեռախոս դաշտերն ունեն ճիշտ autocomplete տեսակ, որ բրաուզերը կարողանա ինքնաշխատ լրացնել դրանք։
type State = 'idle' | 'sending' | 'success' | 'error' | 'mailto';

export default function ContactForm() {
  const { lang } = useLanguage();
  const t = contact[lang];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState(0);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [errors, setErrors] = useState({ name: false, phone: false, email: false });
  const [state, setState] = useState<State>('idle');

  useEffect(() => {
    const estimate = new URLSearchParams(window.location.search).get('estimate');
    if (estimate) setMessage(m => m || `${t.estimateLine}: ${estimate}\n\n`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openMailto = () => {
    const subject = `GARON Construction — ${t.types[type]}`;
    const lines = [`${t.formName}: ${name.trim()}`, `${t.formPhone}: ${phone.trim()}`, email.trim() && `${t.formEmail}: ${email.trim()}`, `${t.formType}: ${t.types[type]}`].filter(Boolean).join('\n');
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${lines}\n\n${message.trim()}`)}`;
    setState('mailto');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'sending') return;
    const digits = phone.replace(/\D/g, '');
    const next = {
      name: name.trim().length < 2,
      phone: digits.length < 6 || digits.length > 15,
      email: Boolean(email.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    };
    setErrors(next);
    if (next.name || next.phone || next.email) return;
    setState('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, type: t.types[type], message, website, page: window.location.pathname, lang })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) { setState('success'); return; }
      if (res.status === 503 && data.fallback === 'mailto') { openMailto(); return; }
      if (res.status === 400 && data.fields) {
        setErrors({ name: Boolean(data.fields.name), phone: Boolean(data.fields.phone), email: Boolean(data.fields.email) });
        setState('idle');
        return;
      }
      setState('error');
    } catch {
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="contactForm formSuccess" role="status">
        <b className="formSuccessMark" aria-hidden="true">✓</b>
        <h3>{t.successTitle}</h3>
        <p>{t.successText}</p>
        {contactLinks.whatsapp && <a className="button gold" href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>}
      </div>
    );
  }

  return (
    <form className="contactForm" onSubmit={submit} noValidate aria-busy={state === 'sending'}>
      <p>{t.cardText}</p>
      <label className={errors.name ? 'invalid' : ''}>
        <span>{t.formName} *</span>
        <input name="name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" aria-invalid={errors.name} required />
        {errors.name && <em>{t.required}</em>}
      </label>
      <div className="contactFormRow">
        <label className={errors.phone ? 'invalid' : ''}>
          <span>{t.formPhone} *</span>
          <input type="tel" name="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="+374" aria-invalid={errors.phone} required />
          {errors.phone && <em>{t.phoneRequired}</em>}
        </label>
        <label className={errors.email ? 'invalid' : ''}>
          <span>{t.formEmail} <i>{t.optional}</i></span>
          <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" aria-invalid={errors.email} />
          {errors.email && <em>{t.emailInvalid}</em>}
        </label>
      </div>
      <label>
        <span>{t.formType}</span>
        <select value={type} onChange={e => setType(Number(e.target.value))}>
          {t.types.map((label, i) => <option key={label} value={i}>{label}</option>)}
        </select>
      </label>
      <label>
        <span>{t.formMessage} <i>{t.optional}</i></span>
        <textarea rows={5} value={message} onChange={e => setMessage(e.target.value)} />
      </label>
      <label className="hp" aria-hidden="true">
        <span>Website</span>
        <input name="website" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
      </label>
      <button type="submit" className="button gold" disabled={state === 'sending'}>{state === 'sending' ? t.sending : t.send}</button>
      <small role={state === 'error' ? 'alert' : undefined}>
        {state === 'error' ? <>{t.errorText} <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></>
          : state === 'mailto' ? <>{t.sentNote} <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></>
          : t.hint}
      </small>
    </form>
  );
}
