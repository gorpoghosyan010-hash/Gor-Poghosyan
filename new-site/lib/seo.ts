import type { Metadata } from 'next';
import { locales, localeNames, localizePath, type Locale } from './i18n';
import { siteUrl } from './site-url';

export function alternates(locale: Locale, path: string): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = localizePath(l, path);
  languages['x-default'] = localizePath('hy', path);
  return { canonical: localizePath(locale, path), languages };
}

export function pageMetadata(opts: {
  locale: Locale;
  path: string;
  title?: string;
  description: string;
  image?: string;
}): Metadata {
  const image = opts.image ?? '/media/og.jpg';
  return {
    title: opts.title,
    description: opts.description,
    alternates: alternates(opts.locale, opts.path),
    openGraph: {
      type: 'website',
      siteName: 'GARON Construction',
      locale: localeNames[opts.locale].og,
      url: `${siteUrl}${localizePath(opts.locale, opts.path)}`,
      title: opts.title ? `${opts.title} — GARON` : 'GARON — Construction & Architecture',
      description: opts.description,
      images: [{ url: image }]
    },
    twitter: { card: 'summary_large_image', images: [image] }
  };
}
