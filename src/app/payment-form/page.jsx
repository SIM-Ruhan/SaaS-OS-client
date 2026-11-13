import { redirect } from 'next/navigation';
export default async function Page({ searchParams }) {
  const { shop } = await searchParams;
  if (typeof shop === 'string' && /^[a-z0-9-]{2,55}$/.test(shop)) redirect(`/shops/${shop}/cart`);
  redirect('/shops');
}
