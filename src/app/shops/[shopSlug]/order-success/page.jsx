import { Receipt } from '@/components/shopos/receipt';
export const metadata = {
  title: 'Order tracking',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default async function Page({ params, searchParams }) {
  const { shopSlug } = await params;
  return <Receipt values={await searchParams} slug={shopSlug} />;
}
