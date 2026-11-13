import { notFound } from 'next/navigation';
import { apiServer, identity, siteOrigin, storefrontRequest } from '@/lib/shopos-server';
import { shopPath } from '@/lib/shopos';
import { CampaignLanding } from '@/components/shopos/campaign';
export async function generateMetadata({ params }) {
  const { shopSlug, pageSlug } = await params;
  const path = shopPath(shopSlug, `/pages/${encodeURIComponent(pageSlug)}`),
    page = await apiServer(path);
  return page
    ? {
        title: page.seoTitle || page.title,
        description: page.seoDescription || page.product.description?.slice(0, 180),
        alternates: {
          canonical: `${siteOrigin()}${shopPath(shopSlug, `/p/${encodeURIComponent(pageSlug)}`)}`,
        },
      }
    : { title: 'Offer unavailable' };
}
export default async function Page({ params }) {
  const { shopSlug, pageSlug } = await params,
    base = shopPath(shopSlug);
  const [shop, page, user, { buyerCountry }] = await Promise.all([
    apiServer(base),
    apiServer(`${base}/pages/${encodeURIComponent(pageSlug)}`),
    identity(),
    storefrontRequest(),
  ]);
  if (!shop || !page) notFound();
  return (
    <main id="main-content" className="wrap shop-main stack">
      <h1 className="sr-only">{page.title}</h1>
      <CampaignLanding shop={shop} initial={page} user={user} buyerCountry={buyerCountry} />
    </main>
  );
}
