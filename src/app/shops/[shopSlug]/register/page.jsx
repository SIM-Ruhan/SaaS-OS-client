import { redirect } from 'next/navigation';
import { shopPath } from '@/lib/shopos';
export default async function Page({ params }) {
  const { shopSlug } = await params;
  redirect(shopPath(shopSlug, '/registration'));
}
