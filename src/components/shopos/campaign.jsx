'use client';

import { useEffect, useState } from 'react';
import { LandingSections } from './landing';
import { LandingOrder } from './checkout';
import { track, useAnalyticsConsent, visitorId } from './tracking';
import { request, shopPath } from '@/lib/shopos';

export function CampaignLanding({ shop, initial, user, buyerCountry }) {
  const [assigned, setAssigned] = useState(null);
  const consent = useAnalyticsConsent();
  useEffect(() => {
    const controller = new AbortController();
    if (!initial.abEnabled) return undefined;
    request(shopPath(shop.slug, `/pages/${initial.slug}?visitor=${encodeURIComponent(visitorId())}`), {
      signal: controller.signal,
    })
      .then((data) => {
        if (!controller.signal.aborted) setAssigned(data);
      })
      .catch(() => null);
    return () => controller.abort();
  }, [shop.slug, initial.slug, initial.abEnabled]);
  useEffect(() => {
    if (consent !== 'yes') return;
    track(shop, 'PageView', { pageSlug: initial.slug });
    track(shop, 'ViewContent', { pageSlug: initial.slug, value: initial.product.price });
  }, [shop, initial.slug, initial.product.price, consent]);
  const page = assigned || initial;
  const hasOrder = page.sections.some((section) => section.type === 'order');
  return (
    <>
      <LandingSections
        sections={page.sections}
        product={page.product}
        currency={shop.currency}
        order={<LandingOrder shop={shop} page={page} user={user} buyerCountry={buyerCountry} />}
      />
      {!hasOrder && (
        <section id="order" className="landing-block">
          <h2>Place your order</h2>
          <LandingOrder shop={shop} page={page} user={user} buyerCountry={buyerCountry} />
        </section>
      )}
    </>
  );
}
