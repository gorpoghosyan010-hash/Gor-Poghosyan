'use client';

import { useState } from 'react';
import type { Dictionary } from '@/content/dictionaries/en';

type Form = Dictionary['contact']['form'];
type Errors = Partial<Record<'name' | 'contact' | 'message', string>>;

/**
 * No backend yet: on submit the visitor's mail app opens with a ready message to GARON.
 * (To receive inquiries server-side later, swap `submit` for a POST to an API route.)
 */
export default function ContactForm({ t, email }: { t: Form; email: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const next: Errors = {};
    if (!d.name?.trim()) next.name = t.required;
    if (!d.email?.trim() && !d.phone?.trim()) next.contact = t.contactRequired;
    if (!d.message?.trim()) next.message = t.required;
    setErrors(next);
    if (Object.keys(next).length) {
      e.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    const body = [`${t.name}: ${d.name}`, `${t.email}: ${d.email}`, `${t.phone}: ${d.phone}`, `${t.type}: ${d.type}`, '', d.message].join('\n');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(`GARON — ${d.type}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field =
    'peer w-full border-0 border-b hairline bg-transparent px-0 pb-3 pt-7 text-lg text-stone outline-none transition-colors placeholder:text-transparent focus:border-bronze aria-[invalid=true]:border-[#d98b6f]';
  const label =
    'pointer-events-none absolute left-0 top-7 text-sand transition-all duration-300 peer-focus:top-0 peer-focus:text-xs peer-focus:text-bronze peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs';

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <div className="relative">
        <input id="f-name" name="name" autoComplete="name" placeholder=" " aria-invalid={!!errors.name} aria-describedby={errors.name ? 'e-name' : undefined} className={field} />
        <label htmlFor="f-name" className={label}>
          {t.name} *
        </label>
        {errors.name && <p id="e-name" className="mt-2 text-xs text-[#d98b6f]">{errors.name}</p>}
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="relative">
          <input id="f-email" name="email" type="email" autoComplete="email" placeholder=" " aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'e-contact' : undefined} className={field} />
          <label htmlFor="f-email" className={label}>
            {t.email}
          </label>
        </div>
        <div className="relative">
          <input id="f-phone" name="phone" type="tel" autoComplete="tel" placeholder=" " aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'e-contact' : undefined} className={field} />
          <label htmlFor="f-phone" className={label}>
            {t.phone}
          </label>
        </div>
        {errors.contact && (
          <p id="e-contact" className="-mt-5 text-xs text-[#d98b6f] sm:col-span-2">
            {errors.contact}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="label mb-4">{t.type}</legend>
        <div className="flex flex-wrap gap-2">
          {t.types.map((type, i) => (
            <label key={type} className="cursor-pointer">
              <input type="radio" name="type" value={type} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-block rounded-full border hairline px-4 py-2 text-sm text-sand transition-colors duration-300 hover:text-stone peer-checked:border-bronze peer-checked:bg-bronze peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bronze">
                {type}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="relative">
        <textarea id="f-message" name="message" rows={4} placeholder=" " aria-invalid={!!errors.message} aria-describedby={errors.message ? 'e-message' : undefined} className={`${field} resize-y`} />
        <label htmlFor="f-message" className={label}>
          {t.message} *
        </label>
        {errors.message && <p id="e-message" className="mt-2 text-xs text-[#d98b6f]">{errors.message}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" className="btn-round btn-solid group">
          {t.send}
          <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
        </button>
        <p className="max-w-xs text-xs text-sand">{t.hint}</p>
      </div>

      <p role="status" className="text-sm text-sand">
        {sent && (
          <>
            {t.sentNote}{' '}
            <a href={`mailto:${email}`} className="link-line text-stone">
              {email}
            </a>
          </>
        )}
      </p>
    </form>
  );
}
