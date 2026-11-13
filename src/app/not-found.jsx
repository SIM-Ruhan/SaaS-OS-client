import { SiteNav } from '@/components/shopos/home';
import { Button, Empty } from '@/components/shopos/ui';
export default function NotFound() {
  return (
    <>
      <SiteNav compact />
      <main id="main-content" className="wrap shop-main">
        <section className="surface">
          <Empty
            title="Page unavailable"
            description="Check the address or go back to the shop directory."
          >
            <Button href="/shops">Explore shops</Button>
          </Empty>
        </section>
      </main>
    </>
  );
}
