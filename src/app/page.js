import { Home } from '@/components/shopos/home';
import { apiServer } from '@/lib/shopos-server';
export default async function Page() {
  return <Home plans={await apiServer('/plans')} />;
}
