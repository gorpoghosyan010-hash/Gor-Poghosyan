import type { MetadataRoute } from 'next';
import { siteUrl } from '../content/seo';
import { getProjects } from '../content/projects';

const paths = [
  '/', '/about', '/services', '/services/pools', '/services/residential', '/services/renovation', '/services/public-works',
  '/projects', '/calculator', '/contact'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const all = [...paths, ...getProjects().map(p => `/projects/${p.slug}`)];
  return all.map(path => ({ url: `${siteUrl}${path}`, lastModified: now, changeFrequency: 'monthly', priority: path === '/' ? 1 : path.startsWith('/services') || path === '/calculator' ? 0.8 : 0.6 }));
}
