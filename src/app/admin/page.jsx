import { redirect } from 'next/navigation';
import { Admin } from '@/components/shopos/admin';
import { apiServer, identity } from '@/lib/shopos-server';
export const metadata = { title: 'Platform admin', robots: { index: false, follow: false } };
export default async function Page() {
  const user = await identity();
  if (!user) redirect('/login?redirect=/admin');
  const me = await apiServer('/me', user);
  if (!me?.admin) redirect('/unauthorized');
  return <Admin />;
}
