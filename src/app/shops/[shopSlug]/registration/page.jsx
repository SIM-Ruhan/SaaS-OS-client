import { notFound } from 'next/navigation';
import { AuthForm } from '@/components/shopos/auth-form';
import { apiServer } from '@/lib/shopos-server';
import { shopPath } from '@/lib/shopos';
export const metadata = { title: 'Shop account', robots: { index: false } };
export default async function Page({ params, searchParams }) {
  const { shopSlug } = await params,
    query = await searchParams;
  const shop = await apiServer(shopPath(shopSlug));
  if (!shop) notFound();
  return (
    <AuthForm
      mode="register"
      shopSlug={shop.slug}
      shopName={shop.name}
      redirectTo={query.redirect}
      google={!!(process.env.CLIENT_ID && process.env.CLIENT_SECRET)}
    />
  );
}
