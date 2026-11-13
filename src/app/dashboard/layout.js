import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { apiServer, identity } from '@/lib/shopos-server';
import { WorkspaceShell } from '@/components/shopos/workspace';
import { Loading } from '@/components/shopos/ui';
export const metadata = { title: 'Seller workspace', robots: { index: false, follow: false } };
export default async function Layout({ children }) {
  const user = await identity();
  if (!user) redirect('/login?redirect=/dashboard');
  if (user.blocked) redirect('/unauthorized');
  const me = await apiServer('/me', user);
  return (
    <Suspense fallback={<Loading label="Opening seller workspace…" />}>
      <WorkspaceShell user={user} admin={!!me?.admin}>
        {children}
      </WorkspaceShell>
    </Suspense>
  );
}
