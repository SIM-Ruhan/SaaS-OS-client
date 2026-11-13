import Link from 'next/link';
import { FiArrowUpRight, FiShoppingBag } from 'react-icons/fi';
import { SiteFooter, SiteNav } from '@/components/shopos/home';
import { Empty, Heading, ProductImage } from '@/components/shopos/ui';
import { apiServer } from '@/lib/shopos-server';
import { shopPath } from '@/lib/shopos';
export const metadata = { title: 'Explore shops' };
export default async function Page() {
  const shops = await apiServer('/shops?limit=100');
  return (
    <>
      <SiteNav />
      <main className="wrap shop-main" id="main-content">
        <Heading
          eyebrow="ShopOS directory"
          title="Explore independent shops"
          description="Find stores built by independent sellers."
        />
        {shops?.length ? (
          <div className="grid-3">
            {shops.map((shop) => (
              <Link href={shopPath(shop.slug)} className="surface directory-card" key={shop.id}>
                {shop.logoUrl ? (
                  <ProductImage src={shop.logoUrl} />
                ) : (
                  <div className="feature-icon">
                    <FiShoppingBag />
                  </div>
                )}
                <div>
                  <h3>{shop.name}</h3>
                  <p className="muted fine clamp-2">
                    {shop.description || `Browse the ${shop.name} catalog.`}
                  </p>
                </div>
                <FiArrowUpRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        ) : (
          <section className="surface">
            <Empty title="No shops listed yet" description="Published shops will appear here." />
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
