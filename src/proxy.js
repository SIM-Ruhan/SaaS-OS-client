import { NextResponse } from 'next/server';
export async function proxy(request) {
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  const canonical = new URL(process.env.BETTER_AUTH_URL || 'http://localhost:3000');
  const main = canonical.hostname;
  if (
    !host ||
    host === main ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    request.nextUrl.pathname.startsWith('/shops/')
  )
    return NextResponse.next();
  const root = (process.env.SHOPOS_ROOT_DOMAIN || '').toLowerCase();
  const enabled = process.env.ENABLE_CUSTOM_DOMAINS === 'true' || (root && host.endsWith(`.${root}`));
  if (!enabled || !/^[a-z0-9.-]+$/.test(host)) return NextResponse.next();
  const backend = (
    process.env.SHOPOS_SERVER_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
  const response = await fetch(`${backend}/domains/resolve?host=${encodeURIComponent(host)}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(4000),
  }).catch(() => null);
  if (!response?.ok) return NextResponse.next();
  const target = await response.json(),
    url = request.nextUrl.clone();
  const base = `/shops/${encodeURIComponent(target.shopSlug)}`;
  if (/^\/(login|registration|register|account|profile)(\/|$)/.test(url.pathname)) {
    return NextResponse.redirect(new URL(`${base}${url.pathname}${url.search}`, canonical));
  }
  if (url.pathname === '/')
    url.pathname = target.pageSlug ? `${base}/p/${encodeURIComponent(target.pageSlug)}` : base;
  else if (
    /^\/(products|cart|wishlist|account|p|login|registration|order-success)(\/|$)/.test(url.pathname)
  )
    url.pathname = `${base}${url.pathname}`;
  else return NextResponse.next();
  return NextResponse.rewrite(url);
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|media|brand.svg|favicon.ico|sitemap.xml|robots.txt).*)'],
};
