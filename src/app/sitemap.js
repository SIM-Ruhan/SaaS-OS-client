import { apiServer, siteOrigin } from '@/lib/shopos-server';
import { shopPath } from '@/lib/shopos';
export default async function sitemap() {
  const origin = siteOrigin();
  const shops = (await apiServer('/shops?limit=200')) || [];
  const storePages = [];
  for (let start = 0; start < shops.length; start += 10) {
    const group = await Promise.all(
      shops.slice(start, start + 10).map(async (shop) => {
        const base = shopPath(shop.slug),
          [products, pages] = await Promise.all([
            apiServer(`${base}/products?limit=300`),
            apiServer(`${base}/pages`),
          ]);
        return [
          { url: `${origin}${base}` },
          { url: `${origin}${base}/products` },
          ...(products || []).map((item) => ({
            url: `${origin}${base}/products/${item.id}`,
            lastModified: item.updatedAt || item.createdAt,
          })),
          ...(pages || []).map((item) => ({
            url: `${origin}${base}/p/${item.slug}`,
            lastModified: item.updatedAt,
          })),
        ];
      }),
    );
    storePages.push(...group.flat());
  }
  return [{ url: origin }, { url: `${origin}/shops` }, ...storePages];
}
