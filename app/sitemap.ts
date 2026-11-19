import type { MetadataRoute } from 'next';
import { siteUrl } from '../content/seo';

const paths = [
  '/', '/about', '/services', '/services/pools', '/services/residential', '/services/renovation', '/services/public-works',
  '/projects', '/projects/pool-01', '/projects/pool-02', '/projects/pool-03', '/projects/pool-04', '/projects/pool-05', '/projects/house-01',
  '/calculator', '/contact'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return paths.map(path => ({ url: `${siteUrl}${path}`, lastModified: now, changeFrequency: 'monthly', priority: path === '/' ? 1 : path.startsWith('/services') || path === '/calculator' ? 0.8 : 0.6 }));
}
