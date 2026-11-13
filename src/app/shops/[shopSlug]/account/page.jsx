import { notFound, redirect } from 'next/navigation';
import { apiServer, identity } from '@/lib/shopos-server';
import { shopPath } from '@/lib/shopos';
import { AccountOrders } from '@/components/shopos/storefront';
export const metadata = { title: 'My orders', robots: { index: false } };
export default async function Page({ params }) {
  const { shopSlug } = await params;
  const user = await identity();
  if (!user)
    redirect(
      `${shopPath(shopSlug, '/login')}?redirect=${encodeURIComponent(shopPath(shopSlug, '/account'))}`,
    );
  const shop = await apiServer(shopPath(shopSlug));
  if (!shop) notFound();
  return <AccountOrders shop={shop} user={user} />;
}
