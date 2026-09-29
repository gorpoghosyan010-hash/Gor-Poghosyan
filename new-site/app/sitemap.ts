import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';
import { locales, localizePath } from '@/lib/i18n';
import { siteUrl } from '@/lib/site-url';

const paths = ['/', '/projects', '/services', '/about', '/process', '/contact', ...projects.map((p) => `/projects/${p.slug}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}${localizePath(locale, path)}`,
      changeFrequency: 'monthly' as const,
      priority: path === '/' ? 1 : path.startsWith('/projects/') ? 0.7 : 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}${localizePath(l, path)}`]))
      }
    }))
  );
}
