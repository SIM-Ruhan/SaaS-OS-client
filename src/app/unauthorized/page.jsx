import { SiteNav } from '@/components/shopos/home';
import { Button, Empty } from '@/components/shopos/ui';
export default function Page() {
  return (
    <>
      <SiteNav compact />
      <main id="main-content" className="wrap shop-main">
        <section className="surface">
          <Empty
            title="Access unavailable"
            description="Sign in with an account that has access to this workspace."
          >
            <Button href="/login">Sign in</Button>
          </Empty>
        </section>
      </main>
    </>
  );
}
