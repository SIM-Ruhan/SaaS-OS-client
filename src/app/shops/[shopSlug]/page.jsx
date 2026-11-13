import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowRight, FiLayers, FiPackage } from 'react-icons/fi';
import { apiServer, identity, siteOrigin } from '@/lib/shopos-server';
import { shopPath, workspaceLink } from '@/lib/shopos';
import { Button, ProductImage } from '@/components/shopos/ui';
import { ProductGrid } from '@/components/shopos/storefront';
export async function generateMetadata({ params }) {
  const { shopSlug } = await params,
    shop = await apiServer(shopPath(shopSlug));
  return shop
    ? {
        title: shop.seo?.title || shop.name,
        description: shop.seo?.description || shop.description,
        alternates: { canonical: `${siteOrigin()}${shopPath(shop.slug)}` },
      }
    : { title: 'Shop unavailable' };
}
export default async function Page({ params }) {
  const { shopSlug } = await params,
    base = shopPath(shopSlug);
  const [shop, products, pages, user] = await Promise.all([
    apiServer(base),
    apiServer(`${base}/products?limit=8`),
    apiServer(`${base}/pages`),
    identity(),
  ]);
  if (!shop) notFound();
  const membership = user ? await apiServer('/my/shops', user) : null;
  const editable = ['owner', 'manager'].includes(
    membership?.find((item) => item.slug === shopSlug)?.role,
  );
  const banner = shop.banners[0];
  return (
    <main id="main-content">
      <section className={`wrap store-hero${banner?.imageUrl ? ' has-image' : ''}`}>
        <div className="store-hero-copy">
          <p className="eyebrow">{shop.name}</p>
          <h1>{banner?.heading || shop.name}</h1>
          <p>{banner?.description || shop.description}</p>
          <div className="row">
            <Button tone="lime" href={banner?.ctaLink || `${base}/products`}>
              {banner?.ctaText || (shop.language === 'bn' ? 'পণ্য দেখুন' : 'Explore products')}{' '}
              <FiArrowRight />
            </Button>
            {editable && (
              <Button
                tone="secondary"
                href={`${workspaceLink('/dashboard/settings', shop.slug)}#storefront-content`}
              >
                Edit store
              </Button>
            )}
          </div>
        </div>
        {banner?.imageUrl && (
          <ProductImage src={banner.imageUrl} alt={banner.heading || shop.name} priority />
        )}
      </section>
      <div className="wrap shop-main stack-lg">
        {shop.categories.length > 0 && (
          <section className="stack" id="categories">
            <h2>Shop by category</h2>
            <div className="row">
              {shop.categories.map((item) => (
                <Link
                  key={item.id}
                  className="button button-secondary"
                  href={`${base}/products?category=${encodeURIComponent(item.name)}`}
                >
                  {item.imageUrl ? (
                    <ProductImage src={item.imageUrl} className="h-8 w-8" sizes="32px" />
                  ) : (
                    <FiLayers />
                  )}
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="stack">
          <div className="row between">
            <h2>{shop.language === 'bn' ? 'নতুন পণ্য' : 'Latest products'}</h2>
            <Link className="external" href={`${base}/products`}>
              View catalog <FiArrowRight />
            </Link>
          </div>
          <ProductGrid shop={shop} products={products || []} />
        </section>
        {shop.banners.slice(1).map((item) => (
          <section key={item.id} className="surface grid-2">
            {item.imageUrl && <ProductImage src={item.imageUrl} alt={item.heading} />}
            <div className="stack">
              <h2>{item.heading}</h2>
              <p className="muted">{item.description}</p>
              {item.ctaText && item.ctaLink && (
                <div>
                  <Button href={item.ctaLink}>
                    {item.ctaText} <FiArrowRight />
                  </Button>
                </div>
              )}
            </div>
          </section>
        ))}
        {shop.staticSections.map((item) => (
          <section key={item.id} className="surface grid-2">
            {item.imageUrl && <ProductImage src={item.imageUrl} alt={item.heading} />}
            <div className="stack">
              <h2>{item.heading}</h2>
              <p className="muted">{item.description}</p>
              {item.ctaText && item.ctaLink && (
                <div>
                  <Button href={item.ctaLink}>
                    {item.ctaText} <FiArrowRight />
                  </Button>
                </div>
              )}
            </div>
          </section>
        ))}
        {pages?.length > 0 && (
          <section className="stack">
            <h2>Featured offers</h2>
            <div className="grid-3">
              {pages.map((item) => (
                <Link key={item.slug} href={`${base}/p/${item.slug}`} className="surface row">
                  <FiPackage />
                  <strong>{item.published?.title || item.slug}</strong>
                  <FiArrowRight />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
