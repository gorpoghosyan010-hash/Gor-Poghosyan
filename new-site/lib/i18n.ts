export const locales = ['hy', 'en', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'hy';

export const localeNames: Record<Locale, { short: string; long: string; og: string }> = {
  hy: { short: 'ՀԱՅ', long: 'Հայերեն', og: 'hy_AM' },
  en: { short: 'EN', long: 'English', og: 'en_US' },
  ru: { short: 'РУ', long: 'Русский', og: 'ru_RU' }
};

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/** Armenian lives at the root (/projects); other languages get a prefix (/en/projects). */
export function localizePath(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  if (locale === defaultLocale) return clean || '/';
  return `/${locale}${clean}`;
}

/** Strips a locale prefix from a browser pathname, returning the path shared by all languages. */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|ru|hy)(?=\/|$)/);
  const rest = match ? pathname.slice(match[0].length) : pathname;
  return rest || '/';
}
