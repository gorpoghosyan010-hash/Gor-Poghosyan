import { NextResponse, type NextRequest } from 'next/server';

// Սխալ կամ կարճ հասցեները ինքնաշխատ տանում ենք ճիշտ էջ, որ «Էջը չի գտնվել» չբացվի։
const PROJECTS = ['pool-01', 'pool-02', 'house-01'];
// Նախկին առանձին էջեր (ավարտված լողավազաններ). այժմ ցույց են տրվում «Նախագծեր» էջում
const RETIRED = ['pool-03', 'pool-04', 'pool-05'];
const SERVICES = ['pools', 'residential', 'renovation', 'public-works'];
const PAGES = ['about', 'calculator', 'contact', 'projects', 'services'];

const ALIASES: Record<string, string> = {
  'about-us': '/about',
  'contacts': '/contact',
  'contact-us': '/contact',
  'project': '/projects',
  'portfolio': '/projects',
  'works': '/projects',
  'service': '/services',
  'calc': '/calculator',
  'pool': '/services/pools',
  'house': '/services/residential',
  'houses': '/services/residential',
  'public': '/services/public-works',
  'home': '/',
  'index': '/',
  'index.html': '/'
};

function resolve(path: string): string | null {
  let parts = path.toLowerCase().split('/').filter(Boolean);
  // /hy/..., /en/..., /ru/... — լեզուն ընտրվում է կայքում, ոչ թե հասցեում
  if (parts.length && ['hy', 'en', 'ru', 'am'].includes(parts[0])) parts = parts.slice(1);
  if (parts.length === 0) return '/';
  if (RETIRED.includes(parts[parts.length - 1])) return '/projects';
  const last = parts[parts.length - 1];
  if (parts.length === 1) {
    if (PAGES.includes(last)) return `/${last}`;
    if (PROJECTS.includes(last)) return `/projects/${last}`;
    if (SERVICES.includes(last)) return `/services/${last}`;
    if (ALIASES[last]) return ALIASES[last];
    // pool1, pool-1, house1 → pool-01, house-01
    const m = last.match(/^(pool|house)-?0?(\d)$/);
    if (m && PROJECTS.includes(`${m[1]}-0${m[2]}`)) return `/projects/${m[1]}-0${m[2]}`;
    if (m && RETIRED.includes(`${m[1]}-0${m[2]}`)) return '/projects';
    return null;
  }
  if (parts.length === 2) {
    const [section, slug] = parts;
    const m = slug.match(/^(pool|house)-?0?(\d)$/);
    const project = m ? `${m[1]}-0${m[2]}` : slug;
    if (PROJECTS.includes(project) && ['projects', 'project', 'portfolio', 'works'].includes(section)) return `/projects/${project}`;
    if (SERVICES.includes(slug) && ['services', 'service'].includes(section)) return `/services/${slug}`;
  }
  return null;
}

const VALID = new Set<string>([
  '/', ...PAGES.map((p) => `/${p}`), ...PROJECTS.map((p) => `/projects/${p}`), ...SERVICES.map((s) => `/services/${s}`)
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (VALID.has(clean)) return NextResponse.next();
  const target = resolve(clean);
  if (target && target !== clean) {
    const url = req.nextUrl.clone();
    url.pathname = target;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  // Ֆայլերը (նկար, վիդեո, ֆոնտ) և Next-ի ներքին հասցեները չենք շոշափում
  matcher: ['/((?!_next/|api/|.*\\.(?:webp|jpg|jpeg|png|svg|gif|ico|mp4|webm|woff2?|ttf|txt|xml|json|webmanifest)$).*)']
};
