import { notFound } from 'next/navigation';
import { apiServer } from '@/lib/shopos-server';
import { shopPath } from '@/lib/shopos';
import { BrowseProducts } from '@/components/shopos/storefront';
export const metadata = { title: 'Products' };
export default async function Page({ params, searchParams }) {
  const { shopSlug } = await params;
  const query = await searchParams;
  const [shop, products] = await Promise.all([
    apiServer(shopPath(shopSlug)),
    apiServer(shopPath(shopSlug, '/products?limit=48')),
  ]);
  if (!shop) notFound();
  return (
    <BrowseProducts
      key={typeof query.category === 'string' ? query.category : ''}
      shop={shop}
      initial={products || []}
      initialCategory={typeof query.category === 'string' ? query.category : ''}
    />
  );
}
