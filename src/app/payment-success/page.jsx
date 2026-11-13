import { SiteNav } from '@/components/shopos/home';
import { Receipt } from '@/components/shopos/receipt';
export const metadata = {
  title: 'Payment status',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default async function Page({ searchParams }) {
  return (
    <>
      <SiteNav compact />
      <Receipt values={await searchParams} />
    </>
  );
}
