import { notFound } from 'next/navigation';
import { apiServer, siteOrigin } from '@/lib/shopos-server';
import { shopPath } from '@/lib/shopos';
import { ProductDetail } from '@/components/shopos/storefront';
export async function generateMetadata({ params }) {
  const { shopSlug, productId } = await params;
  const path = shopPath(shopSlug, `/products/${encodeURIComponent(productId)}`),
    item = await apiServer(path);
  return item
    ? {
        title: item.seoTitle || item.name,
        description: item.seoDescription || item.description?.slice(0, 180),
        alternates: { canonical: `${siteOrigin()}${path}` },
        openGraph: { title: item.name, images: item.imageUrl ? [item.imageUrl] : [] },
      }
    : { title: 'Product unavailable' };
}
export default async function Page({ params, searchParams }) {
  const { shopSlug, productId } = await params,
    values = await searchParams;
  const [shop, product] = await Promise.all([
    apiServer(shopPath(shopSlug)),
    apiServer(shopPath(shopSlug, `/products/${encodeURIComponent(productId)}`)),
  ]);
  if (!shop || !product) notFound();
  const related = await apiServer(
    shopPath(
      shopSlug,
      `/products?limit=5${product.category ? `&category=${encodeURIComponent(product.category)}` : ''}`,
    ),
  );
  const variant = product.variants?.some((item) => item.id === values.variant)
    ? values.variant
    : undefined;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku || undefined,
    image: product.images?.length ? product.images : product.imageUrl || undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: shop.currency,
      availability:
        product.stock > 0 || product.variants?.some((item) => item.stock > 0)
          ? 'https://schema.org/InStock'
          : product.backorder
            ? 'https://schema.org/BackOrder'
            : 'https://schema.org/OutOfStock',
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
      />
      <ProductDetail
        shop={shop}
        product={product}
        related={(related || []).filter((item) => item.id !== productId).slice(0, 4)}
        initialVariant={variant}
      />
    </>
  );
}
