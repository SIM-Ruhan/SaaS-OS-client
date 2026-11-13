import { notFound } from 'next/navigation';
import { CartProvider } from '../shopComponents/cartContext';
import { StoreFooter, StoreNav } from '@/components/shopos/storefront';
import { StoreTracking } from '@/components/shopos/tracking';
import { apiServer, identity, storefrontRequest } from '@/lib/shopos-server';
import { shopPath } from '@/lib/shopos';
export default async function Layout({ children, params }) {
  const { shopSlug } = await params;
  const [shop, user, { accountOrigin }] = await Promise.all([
    apiServer(shopPath(shopSlug)),
    identity(),
    storefrontRequest(),
  ]);
  if (!shop) notFound();
  return (
    <CartProvider shopSlug={shopSlug}>
      <div className="store-shell" lang={shop.language}>
        <StoreTracking shop={shop} />
        <StoreNav shop={shop} user={user} accountOrigin={accountOrigin} />
        {children}
        <StoreFooter shop={shop} />
      </div>
    </CartProvider>
  );
}
