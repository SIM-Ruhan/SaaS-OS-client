'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from './ui';
import { request, shopPath } from '@/lib/shopos';

const eventName = 'shopos-consent-changed';
const key = 'shopos_tracking_consent';
function read(key) {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Optional storage. */
  }
}
function subscribe(callback) {
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}
export function useAnalyticsConsent() {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => '',
  );
}
export function visitorId() {
  const previous = read('shopos_visitor');
  if (previous) return previous;
  const value = crypto.randomUUID();
  write('shopos_visitor', value);
  return value;
}
function cookie(name) {
  return (
    document.cookie
      .split('; ')
      .find((item) => item.startsWith(`${name}=`))
      ?.slice(name.length + 1) || ''
  );
}
export function trackingContext(slug) {
  const consent = read(key) === 'yes';
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref && /^[\w-]{3,55}$/.test(ref))
    write(`shopos_affiliate_${slug}`, JSON.stringify({ code: ref, at: Date.now() }));
  let partner = null;
  try {
    partner = JSON.parse(read(`shopos_affiliate_${slug}`));
  } catch {
    /* Ignore malformed data. */
  }
  const affiliateCode = partner && Date.now() - partner.at < 30 * 86_400_000 ? partner.code : '';
  const source = params.get('utm_source')?.toLowerCase();
  const channel = affiliateCode
    ? 'affiliate'
    : ['facebook', 'instagram', 'google', 'tiktok', 'email'].includes(source)
      ? source
      : document.referrer && !document.referrer.startsWith(window.location.origin)
        ? 'referral'
        : read(`shopos_channel_${slug}`) || 'direct';
  if (consent) write(`shopos_channel_${slug}`, channel);
  return {
    consent,
    visitor: visitorId(),
    channel,
    url: `${window.location.origin}${window.location.pathname}`,
    fbp: consent ? cookie('_fbp') : '',
    fbc: consent ? cookie('_fbc') : '',
    affiliateCode,
  };
}
function metaPixel(id) {
  if (!id || read(key) !== 'yes') return;
  if (!window.fbq) {
    const q = function (...args) {
      if (q.callMethod) q.callMethod(...args);
      else q.queue.push(args);
    };
    q.push = q;
    q.loaded = true;
    q.version = '2.0';
    q.queue = [];
    window.fbq = q;
    window._fbq = q;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
  window.fbq('consent', 'grant');
  window.__shoposPixels ||= new Set();
  if (!window.__shoposPixels.has(id)) {
    window.fbq('init', id);
    window.__shoposPixels.add(id);
  }
}
export function browserPurchase(shop, order) {
  if (read(key) !== 'yes' || !shop?.tracking?.metaPixelId) return;
  const id = shop.tracking.metaPixelId,
    once = `shopos_purchase_${order.id}`;
  if (read(once)) return;
  metaPixel(id);
  window.fbq?.(
    'trackSingle',
    id,
    'Purchase',
    { value: order.total, currency: order.currency },
    { eventID: `order-${order.id}` },
  );
  write(once, '1');
}
export function track(shop, name, fields = {}) {
  const ctx = trackingContext(shop.slug);
  if (!ctx.consent) return;
  const eventId = crypto.randomUUID();
  const pixel = shop.tracking?.metaPixelId;
  if (pixel) {
    metaPixel(pixel);
    window.fbq?.(
      'trackSingle',
      pixel,
      name,
      { value: fields.value, currency: fields.currency || shop.currency },
      { eventID: eventId },
    );
  }
  request(shopPath(shop.slug, '/events'), {
    method: 'POST',
    data: { ...ctx, ...fields, name, eventId, currency: fields.currency || shop.currency },
  }).catch(() => null);
}
export function StoreTracking({ shop }) {
  const path = usePathname();
  const consent = useAnalyticsConsent();
  useEffect(() => {
    trackingContext(shop.slug);
    if (consent === 'yes' && !/\/p\/[^/]+\/?$/.test(path)) track(shop, 'PageView');
    if (consent === 'no') window.fbq?.('consent', 'revoke');
  }, [shop, path, consent]);
  return null;
}
export function AnalyticsConsent() {
  const [open, setOpen] = useState(false);
  const consent = useAnalyticsConsent();
  function choose(value) {
    write(key, value);
    window.dispatchEvent(new Event(eventName));
    setOpen(false);
  }
  return (
    <div className="analytics-consent">
      <button
        className="text-sm underline underline-offset-3"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Analytics preferences
      </button>
      {open && (
        <div className="muted-block stack mt-2">
          <p className="fine">Allow anonymous store analytics and configured advertising measurement?</p>
          <div className="row">
            <Button tone={consent === 'yes' ? 'primary' : 'secondary'} onClick={() => choose('yes')}>
              Allow analytics
            </Button>
            <Button tone={consent === 'no' ? 'primary' : 'secondary'} onClick={() => choose('no')}>
              Keep off
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
