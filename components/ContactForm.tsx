'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { contact } from '../content/i18n';
import { siteConfig } from '../content/siteConfig';

// Առանց սերվերի՝ ձևը պատրաստում է նամակ և բացում է այցելուի էլ. փոստի ծրագիրը։
// Երբ ուզեք ուղիղ ուղարկում (email/Telegram), այս մեկ ֆայլը կփոխարինվի fetch-ով։
export default function ContactForm() {
  const { lang } = useLanguage();
  const t = contact[lang];
  const [name, setName] = useState('');
  const [reach, setReach] = useState('');
  const [type, setType] = useState(0);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({ name: false, reach: false, message: false });
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const estimate = new URLSearchParams(window.location.search).get('estimate');
    if (estimate) setMessage(m => m || `${t.estimateLine}: ${estimate}\n\n`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = { name: !name.trim(), reach: !reach.trim(), message: !message.trim() };
    setErrors(next);
    if (next.name || next.reach || next.message) return;
    const subject = `GARON Construction — ${t.types[type]}`;
    const body = `${t.formName}: ${name.trim()}\n${t.formContact}: ${reach.trim()}\n${t.formType}: ${t.types[type]}\n\n${message.trim()}`;
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <form className="contactForm" onSubmit={submit} noValidate>
      <p>{t.cardText}</p>
      <label className={errors.name ? 'invalid' : ''}>
        <span>{t.formName}</span>
        <input value={name} onChange={e => setName(e.target.value)} autoComplete="name" aria-invalid={errors.name} />
        {errors.name && <em>{t.required}</em>}
      </label>
      <label className={errors.reach ? 'invalid' : ''}>
        <span>{t.formContact}</span>
        <input value={reach} onChange={e => setReach(e.target.value)} autoComplete="email tel" aria-invalid={errors.reach} />
        {errors.reach && <em>{t.required}</em>}
      </label>
      <label>
        <span>{t.formType}</span>
        <select value={type} onChange={e => setType(Number(e.target.value))}>
          {t.types.map((label, i) => <option key={label} value={i}>{label}</option>)}
        </select>
      </label>
      <label className={errors.message ? 'invalid' : ''}>
        <span>{t.formMessage}</span>
        <textarea rows={5} value={message} onChange={e => setMessage(e.target.value)} aria-invalid={errors.message} />
        {errors.message && <em>{t.required}</em>}
      </label>
      <button type="submit" className="button gold">{t.send}</button>
      <small>{opened ? <>{t.sentNote} <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></> : t.hint}</small>
    </form>
  );
}
