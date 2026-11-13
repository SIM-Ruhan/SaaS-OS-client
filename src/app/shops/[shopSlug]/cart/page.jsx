import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CartPage } from '@/components/shopos/checkout';
import { Loading } from '@/components/shopos/ui';
import { apiServer, identity, storefrontRequest } from '@/lib/shopos-server';
import { shopPath } from '@/lib/shopos';
export const metadata = { title: 'Cart', robots: { index: false } };
export default async function Page({ params }) {
  const { shopSlug } = await params;
  const [shop, user, requestInfo] = await Promise.all([
    apiServer(shopPath(shopSlug)),
    identity(),
    storefrontRequest(),
  ]);
  if (!shop) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <CartPage shop={shop} user={user} {...requestInfo} />
    </Suspense>
  );
}
