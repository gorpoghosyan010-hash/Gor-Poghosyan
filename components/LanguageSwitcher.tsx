'use client';
import { useLanguage, type Lang } from './LanguageContext';
import { languageNames } from '../content/i18n';

const order: Lang[] = ['hy', 'en', 'ru'];
const labels: Record<Lang, string> = { hy: 'ՀԱՅ', en: 'EN', ru: 'RU' };

// Լեզուները՝ տեքստով, առանց դրոշների, միշտ տեսանելի
export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="langSwitch" role="group" aria-label="Language">
      {order.map(l => (
        <button type="button" key={l} lang={l} className={l === lang ? 'active' : ''} aria-pressed={l === lang} aria-label={languageNames[l]} onClick={() => setLang(l)}>{labels[l]}</button>
      ))}
    </div>
  );
}
