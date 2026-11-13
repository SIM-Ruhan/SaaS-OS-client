'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCreditCard,
  FiLock,
  FiShoppingBag,
  FiTrash2,
  FiTruck,
} from 'react-icons/fi';
import { useCart } from '@/app/shops/shopComponents/cartContext';
import { Button, Empty, Field, Heading, Notice, ProductImage, Rise, Toggle } from './ui';
import { browserPurchase, track, trackingContext, visitorId } from './tracking';
import { useResource } from './workspace';
import { money, paymentLabels, request, shopPath } from '@/lib/shopos';

const countryList = [
  ['BD', 'Bangladesh'],
  ['US', 'United States'],
  ['GB', 'United Kingdom'],
  ['CA', 'Canada'],
  ['AU', 'Australia'],
  ['DE', 'Germany'],
  ['FR', 'France'],
  ['SG', 'Singapore'],
  ['IN', 'India'],
  ['AE', 'United Arab Emirates'],
  ['MY', 'Malaysia'],
  ['OTHER', 'Other country'],
];
const marketCurrencies = {
  BD: 'BDT',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  DE: 'EUR',
  FR: 'EUR',
  SG: 'SGD',
  IN: 'INR',
  AE: 'AED',
  MY: 'MYR',
};
const paymentCopy = {
  cod: 'Pay when your order is delivered.',
  sslcommerz: 'Local cards and payment methods enabled by the merchant.',
  stripe: 'Secure card payment on Stripe.',
  paypal: 'Continue to PayPal to approve the order.',
  aamarpay: 'Pay on aamarPay’s hosted checkout.',
  bkash: 'Pay with a bKash wallet.',
  shurjopay: 'Pay on shurjoPay’s hosted checkout.',
};
function preferredCurrency(shop, country) {
  const selected = marketCurrencies[country];
  return selected === shop.currency || shop.rates?.[selected] ? selected : shop.currency;
}
function deliveryCountries(shop) {
  return [
    ...new Set([
      shop.country,
      ...(shop.shipping || []).map((item) => item.country).filter((code) => code !== '*'),
    ]),
  ];
}
function readCheckout(path) {
  try {
    return JSON.parse(sessionStorage.getItem(path) || 'null');
  } catch {
    return null;
  }
}
function saveCheckout(path, value) {
  try {
    if (value) sessionStorage.setItem(path, JSON.stringify(value));
    else sessionStorage.removeItem(path);
  } catch {
    /* Optional checkout recovery. */
  }
}
function saveReceipt(shop, order) {
  try {
    localStorage.setItem(
      `shopos_receipt_${shop.slug}`,
      JSON.stringify({ id: order.id, token: order.token }),
    );
  } catch {
    /* Optional receipt storage. */
  }
}
function PathaoAddress({ path, form, setForm }) {
  const base = `${path}/couriers/pathao/areas`;
  const cities = useResource(base);
  const zones = useResource(form.pathaoCity ? `${base}?city=${form.pathaoCity}` : null);
  const areas = useResource(form.pathaoZone ? `${base}?zone=${form.pathaoZone}` : null);
  const fields = [
    ['pathaoCity', 'Pathao city', cities],
    ['pathaoZone', 'Pathao zone', zones],
    ['pathaoArea', 'Pathao area', areas],
  ];
  function choose(key, value) {
    setForm((current) => ({
      ...current,
      ...(key === 'pathaoCity'
        ? {
            pathaoZone: '',
            city: cities.data?.find((item) => String(item.id) === value)?.name || current.city,
          }
        : {}),
      ...(key !== 'pathaoArea' ? { pathaoArea: '' } : {}),
      [key]: value,
    }));
  }
  return (
    <fieldset className="stack">
      <legend>Delivery area</legend>
      <div className="fields fields-3">
        {fields.map(([key, label, source]) => (
          <Field key={key} label={label}>
            <select
              value={form[key] || ''}
              disabled={!source.data?.length}
              onChange={(event) => choose(key, event.target.value)}
            >
              <option value="">{source.pending ? 'Loading…' : 'Select'}</option>
              {source.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
        ))}
      </div>
      {fields.some(([, , source]) => source.error) && (
        <p className="muted fine">
          Continue with your written address. The seller can select the delivery area when dispatching.
        </p>
      )}
    </fieldset>
  );
}
export function CheckoutForm({ shop, items, user, buyerCountry, pageSlug, pageVariant, onComplete }) {
  const router = useRouter();
  const countries = deliveryCountries(shop);
  const guessedCountry =
    buyerCountry &&
    (countries.includes(buyerCountry) || shop.shipping?.some((item) => item.country === '*'))
      ? buyerCountry
      : shop.country || 'BD';
  const other =
    !countries.includes(guessedCountry) && !countryList.some(([code]) => code === guessedCountry);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    region: '',
    postcode: '',
    country: other ? 'OTHER' : guessedCountry,
    otherCountry: other ? guessedCountry : '',
    notifySms: false,
    notifyWhatsapp: false,
  });
  const [selected, setSelected] = useState(preferredCurrency(shop, guessedCountry)),
    [shippingId, setShipping] = useState(''),
    [discount, setDiscount] = useState(''),
    [method, setMethod] = useState(''),
    [quote, setQuote] = useState(null),
    [reviewed, setReviewed] = useState(''),
    [reminder, setReminder] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [pending, setPending] = useState(null);
  const country = form.country === 'OTHER' ? form.otherCountry : form.country;
  const cart = items.map((item) => ({ id: item.id, variantId: item.variantId || '', qty: item.qty }));
  const body = {
    customer: { ...form, country },
    items: cart,
    currency: selected,
    shippingId,
    discountCode: discount.trim(),
  };
  const fingerprint = JSON.stringify(body);
  const freshQuote = reviewed === fingerprint ? quote : null;
  const path = shopPath(shop.slug);
  const sessionKey = `shopos_checkout_${shop.slug}${pageSlug ? `_${pageSlug}` : ''}`;
  const allowedMethods = freshQuote?.payments || [];
  const estimated =
    items.reduce((sum, item) => sum + item.qty * item.price, 0) * (shop.rates?.[selected] || 1);
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  function selectCountry(value) {
    setForm((current) => ({
      ...current,
      country: value,
      pathaoCity: '',
      pathaoZone: '',
      pathaoArea: '',
    }));
    setSelected(preferredCurrency(shop, value));
    setShipping('');
  }
  async function online(order) {
    const next = await request(`${path}/orders/${order.id}/pay`, {
      method: 'POST',
      data: { token: order.token },
    });
    window.location.assign(next.url);
  }
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (!freshQuote || !method || !allowedMethods.includes(method)) {
        const next = await request(`${path}/checkout/quote`, { method: 'POST', data: body });
        setQuote(next);
        setReviewed(JSON.stringify({ ...body, shippingId: next.shippingId }));
        setShipping(next.shippingId);
        setMethod(next.payments.includes(method) ? method : next.payments[0] || '');
        track(shop, 'InitiateCheckout', { pageSlug, value: next.total, currency: next.currency });
        if (reminder && form.email)
          await request(`${path}/abandoned`, {
            method: 'POST',
            data: { email: form.email, visitor: visitorId(), items: cart, consent: true },
          }).catch(() => null);
        return;
      }
      if (['sslcommerz', 'aamarpay', 'shurjopay'].includes(method) && !form.email)
        throw new Error('Enter an email address for this payment method, then review the order again.');
      const checkout = readCheckout(sessionKey);
      const key = JSON.stringify([fingerprint, method]);
      const checkoutKey = checkout?.key === key ? checkout.checkoutKey : crypto.randomUUID();
      saveCheckout(sessionKey, { key, checkoutKey });
      const tracking = trackingContext(shop.slug);
      const order = await request(`${path}/orders`, {
        method: 'POST',
        data: {
          ...body,
          checkoutKey,
          paymentMethod: method,
          affiliateCode: tracking.affiliateCode,
          tracking,
          pageSlug,
          pageVariant,
        },
      });
      saveCheckout(sessionKey, { key, checkoutKey, orderId: order.id });
      saveReceipt(shop, order);
      if (order.paymentMethod !== 'cod') {
        setPending(order);
        if (order.paymentStatus === 'pending') await online(order);
        else
          router.push(
            `/payment-success?${new URLSearchParams({ gateway: order.paymentMethod, order: order.id, token: order.token, shop: shop.slug })}`,
          );
        return;
      }
      browserPurchase(shop, order);
      saveCheckout(sessionKey, null);
      onComplete?.();
      router.push(
        `${path}/order-success?${new URLSearchParams({ order: order.id, token: order.token })}`,
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function retry() {
    setBusy(true);
    setError('');
    try {
      await online(pending);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  if (!items.length) return <Notice tone="warn">Choose an available item before checking out.</Notice>;
  return (
    <form className="stack" onSubmit={submit}>
      <div className="fields">
        <Field
          label="Full name"
          value={form.name}
          autoComplete="name"
          required
          minLength={2}
          onChange={(event) => change('name', event.target.value)}
        />
        <Field
          label="Phone"
          value={form.phone}
          type="tel"
          autoComplete="tel"
          required
          onChange={(event) => change('phone', event.target.value)}
        />
        <div className="field-span">
          <Field
            label="Email address"
            value={form.email}
            type="email"
            autoComplete="email"
            hint={
              shop.payments?.some((method) => ['sslcommerz', 'aamarpay', 'shurjopay'].includes(method))
                ? 'Required for some online payment methods.'
                : undefined
            }
            onChange={(event) => change('email', event.target.value)}
          />
        </div>
        <div className="field-span">
          <Field
            label="Street address"
            value={form.address}
            autoComplete="street-address"
            required
            minLength={5}
            onChange={(event) => change('address', event.target.value)}
          />
        </div>
        <Field
          label="City"
          value={form.city}
          autoComplete="address-level2"
          onChange={(event) => change('city', event.target.value)}
        />
        <Field
          label="Postal code"
          value={form.postcode}
          autoComplete="postal-code"
          onChange={(event) => change('postcode', event.target.value)}
        />
        <Field
          label="Region"
          value={form.region}
          autoComplete="address-level1"
          onChange={(event) => change('region', event.target.value)}
        />
        <Field label="Delivery country">
          <select value={form.country} onChange={(event) => selectCountry(event.target.value)}>
            {[
              ...countryList.filter(
                ([code]) =>
                  code !== 'OTHER' &&
                  (countries.includes(code) || shop.shipping?.some((item) => item.country === '*')),
              ),
              ...countries
                .filter((code) => code && !countryList.some(([value]) => value === code))
                .map((code) => [code, code]),
              ...(shop.shipping?.some((item) => item.country === '*')
                ? [['OTHER', 'Other country']]
                : []),
            ].map(([code, label]) => (
              <option value={code} key={code}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        {form.country === 'OTHER' && (
          <Field
            label="Country code"
            required
            pattern="[A-Za-z]{2}"
            maxLength={2}
            value={form.otherCountry || ''}
            onChange={(event) => change('otherCountry', event.target.value.toUpperCase())}
          />
        )}
        <Field label="Currency">
          <select value={selected} onChange={(event) => setSelected(event.target.value)}>
            {[
              shop.currency,
              ...Object.keys(shop.rates || {}).filter((code) => code !== shop.currency),
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Discount code"
          value={discount}
          onChange={(event) => setDiscount(event.target.value.toUpperCase())}
        />
      </div>
      {shop.pathao && country === 'BD' && <PathaoAddress path={path} form={form} setForm={setForm} />}
      {quote?.shippingOptions.length > 1 && (
        <Field label="Delivery option">
          <select value={shippingId} onChange={(event) => setShipping(event.target.value)}>
            {quote.shippingOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
      )}
      {shop.orderMessaging?.sms && (
        <Toggle checked={form.notifySms} onChange={(event) => change('notifySms', event.target.checked)}>
          Send delivery updates by SMS
        </Toggle>
      )}
      {shop.orderMessaging?.whatsapp && (
        <Toggle
          checked={form.notifyWhatsapp}
          onChange={(event) => change('notifyWhatsapp', event.target.checked)}
        >
          Send delivery updates by WhatsApp
        </Toggle>
      )}
      {shop.orderMessaging?.email && form.email && (
        <Toggle checked={reminder} onChange={(event) => setReminder(event.target.checked)}>
          Send one email reminder if I leave this cart
        </Toggle>
      )}
      {freshQuote && (
        <Rise className="stack">
          <div className="muted-block">
            <div className="detail-row">
              <span>Subtotal</span>
              <strong>{money(freshQuote.subtotal, freshQuote.currency)}</strong>
            </div>
            <div className="detail-row">
              <span>Delivery</span>
              <strong>{money(freshQuote.shipping, freshQuote.currency)}</strong>
            </div>
            {freshQuote.discount > 0 && (
              <div className="detail-row">
                <span>Discount</span>
                <strong>−{money(freshQuote.discount, freshQuote.currency)}</strong>
              </div>
            )}
            <div className="detail-row">
              <strong>Total</strong>
              <strong>{money(freshQuote.total, freshQuote.currency)}</strong>
            </div>
          </div>
          {allowedMethods.length ? (
            <fieldset className="stack">
              <legend>Payment method</legend>
              {allowedMethods.map((value) => (
                <label className={`payment-option${value === method ? ' is-selected' : ''}`} key={value}>
                  <input
                    type="radio"
                    checked={value === method}
                    name="payment"
                    onChange={() => setMethod(value)}
                  />
                  {value === 'cod' ? <FiTruck /> : <FiCreditCard />}
                  <span>
                    <strong>{paymentLabels[value]}</strong>
                    <small>{paymentCopy[value]}</small>
                  </span>
                </label>
              ))}
            </fieldset>
          ) : (
            <Notice tone="warn">
              No payment methods are available for this delivery destination and currency.
            </Notice>
          )}
        </Rise>
      )}
      <Notice tone="error">{error}</Notice>
      {pending && error && (
        <div>
          <Button tone="secondary" disabled={busy} onClick={retry}>
            Retry payment for order #{pending.id.slice(-7)}
          </Button>
        </div>
      )}
      <Button type="submit" disabled={busy || (!!freshQuote && !allowedMethods.length)}>
        {busy
          ? 'Working…'
          : freshQuote && method
            ? `${method === 'cod' ? 'Place order' : 'Continue to payment'} · ${money(freshQuote.total, freshQuote.currency)}`
            : `Review order · ${money(estimated, selected)} estimated`}{' '}
        <FiArrowRight />
      </Button>
      {shop.payments?.some((method) => method !== 'cod') && (
        <p className="row fine muted">
          <FiLock /> Online payments open on the selected provider’s secure checkout.
        </p>
      )}
    </form>
  );
}
export function CartPage({ shop, user, buyerCountry, accountOrigin }) {
  const { items, updateQty, removeItem, clear, addItem } = useCart();
  const params = useSearchParams();
  const [error, setError] = useState(''),
    [recovered, setRecovered] = useState(false);
  const recover = params.get('recover'),
    token = params.get('token');
  async function restore() {
    try {
      const data = await request(
        shopPath(
          shop.slug,
          `/abandoned/${encodeURIComponent(recover)}?token=${encodeURIComponent(token)}`,
        ),
      );
      for (const item of data)
        addItem(
          item,
          item.qty,
          item.variants?.find((entry) => entry.id === item.variantId),
        );
      setRecovered(true);
    } catch (error) {
      setError(error.message);
    }
  }
  return (
    <main className="wrap shop-main" id="main-content">
      <Heading
        title={shop.language === 'bn' ? 'আপনার কার্ট' : 'Your cart'}
        eyebrow={shop.name}
        description="Review your items and choose where to send your order."
        actions={
          <Button href={shopPath(shop.slug, '/products')} tone="secondary">
            <FiArrowLeft /> Keep shopping
          </Button>
        }
      />
      {recover && token && !recovered && (
        <div className="surface row mb-4">
          <span>Restore the items from your saved cart.</span>
          <Button tone="secondary" onClick={restore}>
            Restore cart
          </Button>
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {!items.length ? (
        <section className="surface">
          <Empty title="Your cart is empty" icon={FiShoppingBag}>
            <Button href={shopPath(shop.slug, '/products')}>Browse products</Button>
          </Empty>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="surface stack cart-summary">
            <h2>Your items</h2>
            {items.map((item) => (
              <div className="cart-line" key={item.key}>
                <ProductImage src={item.imageUrl} alt={item.name} />
                <div>
                  <Link className="font-bold" href={shopPath(shop.slug, `/products/${item.id}`)}>
                    {item.name}
                  </Link>
                  {item.variantName && <small className="block">{item.variantName}</small>}
                  <p className="fine">{money(item.price, shop.currency)}</p>
                  <div className="row mt-2">
                    <div className="field w-20">
                      <input
                        aria-label={`Quantity for ${item.name}`}
                        value={item.qty}
                        min="1"
                        max={item.max || 100}
                        type="number"
                        onChange={(event) => {
                          if (event.target.value) updateQty(item.key, Number(event.target.value));
                        }}
                      />
                    </div>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.key)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="detail-row">
              <strong>Items subtotal</strong>
              <strong>
                {money(
                  items.reduce((sum, item) => sum + item.qty * item.price, 0),
                  shop.currency,
                )}
              </strong>
            </div>
          </section>
          <section className="surface stack">
            <h2>Delivery and payment</h2>
            {!user && (
              <p className="fine muted">
                Checking out as a guest.{' '}
                <Link
                  className="underline"
                  href={`${accountOrigin}${shopPath(shop.slug, '/login')}?redirect=${encodeURIComponent(shopPath(shop.slug, '/cart'))}`}
                >
                  Sign in
                </Link>{' '}
                to save the order to your account.
                {accountOrigin && ' Continue here for guest checkout on this domain.'}
              </p>
            )}
            <CheckoutForm
              shop={shop}
              items={items}
              user={user}
              buyerCountry={buyerCountry}
              onComplete={clear}
            />
          </section>
        </div>
      )}
    </main>
  );
}
export function LandingOrder({ shop, page, user, buyerCountry }) {
  const [id, setId] = useState(page.product.variants?.[0]?.id || ''),
    [qty, setQty] = useState(1);
  const product = page.product;
  const variant = product.variants?.find((item) => item.id === id),
    stock = variant?.stock ?? product.stock;
  const available = stock > 0 || product.backorder;
  return (
    <div className="stack">
      <div className="fields">
        <Field label="Product" value={product.name} readOnly />
        {product.variants?.length > 0 && (
          <Field label="Variant">
            <select
              value={id}
              onChange={(event) => {
                setId(event.target.value);
                setQty(1);
              }}
            >
              {product.variants.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name} · {money(item.price, shop.currency)}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field
          label="Quantity"
          type="number"
          value={qty}
          min="1"
          max={product.backorder ? 100 : Math.max(1, stock)}
          onChange={(event) =>
            setQty(
              Math.min(
                product.backorder ? 100 : Math.max(1, stock),
                Math.max(1, Math.trunc(Number(event.target.value) || 1)),
              ),
            )
          }
        />
      </div>
      {available ? (
        <CheckoutForm
          shop={shop}
          pageSlug={page.slug}
          pageVariant={page.variant}
          user={user}
          buyerCountry={buyerCountry}
          items={[{ id: product.id, variantId: id, qty, price: variant?.price ?? product.price }]}
        />
      ) : (
        <Notice tone="warn">This option is out of stock.</Notice>
      )}
    </div>
  );
}
export function ReceiptActions({ shop, order }) {
  useEffect(() => {
    if (
      !shop ||
      !order ||
      order.status === 'cancelled' ||
      !['paid', 'cod_pending'].includes(order.paymentStatus)
    )
      return;
    browserPurchase(shop, order);
    saveReceipt(shop, order);
    const key = `shopos_checkout_${shop.slug}`;
    if (readCheckout(key)?.orderId === order.id) {
      saveCheckout(key, null);
      try {
        localStorage.removeItem(`shopos_cart_${shop.slug}`);
        window.dispatchEvent(new Event('shopos-cart-updated'));
      } catch {
        /* Optional cart storage. */
      }
    }
  }, [shop, order]);
  return null;
}
