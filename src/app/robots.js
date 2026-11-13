import { siteOrigin } from '@/lib/shopos-server';
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin', '/api', '/payment-success'],
    },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
