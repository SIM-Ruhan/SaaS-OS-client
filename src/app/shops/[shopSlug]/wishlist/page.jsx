import { notFound } from 'next/navigation';
import { apiServer } from '@/lib/shopos-server';
import { shopPath } from '@/lib/shopos';
import { BrowseProducts } from '@/components/shopos/storefront';
export const metadata = { title: 'Wishlist', robots: { index: false } };
export default async function Page({ params }) {
  const { shopSlug } = await params;
  const shop = await apiServer(shopPath(shopSlug));
  if (!shop) notFound();
  return <BrowseProducts shop={shop} initial={[]} wishlistOnly />;
}
