import { NextResponse, type NextRequest } from 'next/server';

// Armenian is served without a prefix: /projects -> internally /hy/projects.
// /hy/... is redirected to the clean URL so each page has a single address.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/hy' || pathname.startsWith('/hy/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  if (/^\/(en|ru)(\/|$)/.test(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/hy${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|api|media|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml).*)']
};
