'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiArrowRight,
  FiArrowUpRight,
  FiHeart,
  FiMenu,
  FiMessageCircle,
  FiPackage,
  FiSearch,
  FiShoppingBag,
  FiShoppingCart,
  FiStar,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { AnalyticsConsent, track } from './tracking';
import {
  Brand,
  Button,
  Empty,
  External,
  Field,
  Heading,
  Notice,
  ProductImage,
  Rise,
  Toggle,
} from './ui';
import { Feedback, Resource, useMutation, useResource } from './workspace';
import { useCart } from '@/app/shops/shopComponents/cartContext';
import { dateLabel, getFields, money, shopPath } from '@/lib/shopos';

const favoriteEvent = 'shopos-favorites';
function favorites(key) {
  try {
    return localStorage.getItem(key) || '[]';
  } catch {
    return '[]';
  }
}
function subscribe(fn) {
  window.addEventListener(favoriteEvent, fn);
  window.addEventListener('storage', fn);
  return () => {
    window.removeEventListener(favoriteEvent, fn);
    window.removeEventListener('storage', fn);
  };
}
function useFavorites(slug) {
  const key = `shopos_favorites_${slug}`;
  const raw = useSyncExternalStore(
    subscribe,
    () => favorites(key),
    () => '[]',
  );
  let items;
  try {
    items = JSON.parse(raw);
    if (!Array.isArray(items)) items = [];
  } catch {
    items = [];
  }
  function toggle(id) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(items.includes(id) ? items.filter((item) => item !== id) : [...items, id]),
      );
      window.dispatchEvent(new Event(favoriteEvent));
    } catch {
      /* Optional storage. */
    }
  }
  return { items, toggle };
}
export function StoreNav({ shop, user, accountOrigin = '' }) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const bn = shop.language === 'bn';
  const links = [
    [bn ? 'পণ্য' : 'Products', '/products'],
    [bn ? 'পছন্দের তালিকা' : 'Wishlist', '/wishlist'],
    [bn ? 'অ্যাকাউন্ট' : user ? 'My orders' : 'Account', user ? '/account' : '/login'],
  ];
  return (
    <header className="store-nav">
      <div className="wrap store-nav-inner">
        <Link className="store-brand" href={shopPath(shop.slug)}>
          {shop.logoUrl ? (
            <ProductImage src={shop.logoUrl} />
          ) : (
            <span className="store-mark">
              <FiShoppingBag />
            </span>
          )}
          <strong>{shop.name}</strong>
        </Link>
        <nav className="store-links" aria-label="Store navigation">
          {links.map(([label, url]) => (
            <Link
              key={url}
              href={`${['/login', '/account'].includes(url) ? accountOrigin : ''}${shopPath(shop.slug, url)}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="row flex-nowrap">
          <Link
            href={shopPath(shop.slug, '/cart')}
            className="button button-secondary cart-nav"
            aria-label={`Cart, ${count} items`}
          >
            <FiShoppingCart /> <span>{count}</span>
          </Link>
          <button
            className="icon-button store-menu"
            type="button"
            aria-label={open ? 'Close store navigation' : 'Open store navigation'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="wrap store-mobile-nav"
            aria-label="Mobile store navigation"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {links.map(([label, url]) => (
              <Link
                key={url}
                href={`${['/login', '/account'].includes(url) ? accountOrigin : ''}${shopPath(shop.slug, url)}`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
export function StoreFooter({ shop }) {
  const [mail, setMail] = useState(false);
  const action = useMutation();
  const whatsapp = shop.whatsapp?.replace(/[^\d]/g, '').replace(/^0(?=1\d{9}$)/, '880');
  async function subscribe(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = getFields(form);
    if (
      await action.mutate(
        shopPath(shop.slug, '/subscribe'),
        'POST',
        { email: data.email, consent: data.consent === 'on' },
        'Check your inbox to confirm your subscription.',
      )
    )
      form.reset();
  }
  return (
    <footer className="store-footer">
      <div className="wrap store-footer-inner">
        <div className="stack">
          <h2>{shop.name}</h2>
          <p className="muted fine">{shop.footer?.about || shop.description}</p>
          {shop.footer?.email && (
            <a className="external" href={`mailto:${shop.footer.email}`}>
              {shop.footer.email}
            </a>
          )}
          {shop.footer?.phone && (
            <a className="external" href={`tel:${shop.footer.phone}`}>
              {shop.footer.phone}
            </a>
          )}
          {shop.footer?.address && <p>{shop.footer.address}</p>}
          {whatsapp && (
            <External href={`https://wa.me/${whatsapp}`}>
              <FiMessageCircle /> Chat on WhatsApp
            </External>
          )}
        </div>
        <div className="stack">
          <nav className="row" aria-label="Store footer">
            {Object.entries(shop.footer?.socials || {})
              .filter(([, value]) => value)
              .map(([label, url]) => (
                <External key={label} href={url}>
                  {label}
                </External>
              ))}
            <Link className="external" href={shopPath(shop.slug, '/products')}>
              Shop products
            </Link>
          </nav>
          <button
            type="button"
            className="text-sm underline text-left"
            aria-expanded={mail}
            onClick={() => setMail(!mail)}
          >
            Get store updates
          </button>
          {mail && (
            <form onSubmit={subscribe} className="stack">
              <Field label="Email address" name="email" type="email" required />
              <Toggle name="consent" required>
                Send me updates from this shop
              </Toggle>
              <div>
                <Button type="submit" tone="secondary" disabled={action.busy}>
                  Subscribe
                </Button>
              </div>
              <Feedback action={action} />
            </form>
          )}
          <AnalyticsConsent />
        </div>
        <div className="powered">
          <Brand />
          <small>Storefront powered by ShopOS</small>
        </div>
      </div>
    </footer>
  );
}
export function ProductGrid({ shop, products, empty = 'No products yet' }) {
  const wishlist = useFavorites(shop.slug);
  if (!products.length)
    return (
      <Empty title={empty} description="Check the store catalog for more products." icon={FiPackage} />
    );
  return (
    <div className="store-product-grid">
      {products.map((item, index) => (
        <Rise className="store-product-card" key={item.id} delay={Math.min(index, 7) * 0.045}>
          <Link href={shopPath(shop.slug, `/products/${item.id}`)} aria-label={`View ${item.name}`}>
            <ProductImage
              src={item.imageUrl}
              alt={item.name}
              sizes="(max-width: 590px) 48vw, (max-width: 1000px) 33vw, 280px"
            />
          </Link>
          <button
            className="favorite"
            type="button"
            aria-label={`${wishlist.items.includes(item.id) ? 'Remove from' : 'Add to'} wishlist: ${item.name}`}
            aria-pressed={wishlist.items.includes(item.id)}
            onClick={() => wishlist.toggle(item.id)}
          >
            <FiHeart />
          </button>
          <div className="store-product-body">
            {item.category && <small>{item.category}</small>}
            <h3>
              <Link href={shopPath(shop.slug, `/products/${item.id}`)}>{item.name}</Link>
            </h3>
            <div className="row between">
              <strong>{money(item.price, shop.currency)}</strong>
              <Link
                className="product-arrow"
                href={shopPath(shop.slug, `/products/${item.id}`)}
                aria-label={`Open ${item.name}`}
              >
                <FiArrowUpRight />
              </Link>
            </div>
          </div>
        </Rise>
      ))}
    </div>
  );
}
export function BrowseProducts({ shop, initial, initialCategory = '', wishlistOnly = false }) {
  const [input, setInput] = useState(''),
    [query, setQuery] = useState(''),
    [category, setCategory] = useState(initialCategory),
    [offset, setOffset] = useState(0);
  const favorites = useFavorites(shop.slug);
  const collection = shop.collections?.find((item) => item.id === category);
  const fetchPath = shopPath(
    shop.slug,
    `/products?limit=${wishlistOnly || collection ? 300 : 48}&skip=${offset}&q=${encodeURIComponent(query)}${category && !collection ? `&category=${encodeURIComponent(category)}` : ''}`,
  );
  const needsFetch = wishlistOnly || !!query || !!category || !!offset;
  const resource = useResource(needsFetch ? fetchPath : null);
  const products = (needsFetch ? resource.data || [] : initial).filter(
    (item) =>
      (!wishlistOnly || favorites.items.includes(item.id)) &&
      (!collection || collection.tags.some((tag) => item.tags?.includes(tag))),
  );
  return (
    <main className="wrap shop-main" id="main-content">
      <Heading
        eyebrow={shop.name}
        title={
          wishlistOnly ? 'Your wishlist' : shop.language === 'bn' ? 'সব পণ্য' : 'Shop the collection'
        }
        description={
          wishlistOnly
            ? 'Find the products you saved on this device.'
            : 'Browse products from this store.'
        }
      />
      {!wishlistOnly && (
        <form
          className="catalog-filters surface row"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(input);
            setOffset(0);
          }}
        >
          <Field
            label="Search products"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Field label="Category or collection">
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setOffset(0);
              }}
            >
              <option value="">All products</option>
              {[
                ...new Set([
                  ...(shop.categories || []).map((item) => item.name),
                  ...initial.map((item) => item.category).filter(Boolean),
                ]),
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
              {shop.collections?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Button tone="secondary" type="submit" className="self-end">
            <FiSearch /> Search
          </Button>
        </form>
      )}
      <Notice tone="error">{resource.error}</Notice>
      {resource.pending && !resource.data ? (
        <p role="status" className="muted">
          Loading products…
        </p>
      ) : (
        <ProductGrid
          shop={shop}
          products={products}
          empty={wishlistOnly ? 'Your wishlist is empty' : 'No products match this search'}
        />
      )}
      {!wishlistOnly && !collection && (offset > 0 || products.length === 48) && (
        <div className="row mt-5">
          <Button tone="secondary" disabled={offset === 0} onClick={() => setOffset(offset - 48)}>
            Previous
          </Button>
          <Button
            tone="secondary"
            disabled={products.length < 48}
            onClick={() => setOffset(offset + 48)}
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
}
export function ProductDetail({ shop, product, related, initialVariant }) {
  const [variantId, setVariant] = useState(initialVariant || product.variants?.[0]?.id || ''),
    [image, setImage] = useState(''),
    [quantity, setQuantity] = useState(1),
    [added, setAdded] = useState(false);
  const favorites = useFavorites(shop.slug),
    cart = useCart();
  const variant = product.variants?.find((item) => item.id === variantId);
  const stock = variant?.stock ?? product.stock;
  const canBuy = stock > 0 || product.backorder;
  const images = [
    ...new Set([variant?.imageUrl, product.imageUrl, ...(product.images || [])].filter(Boolean)),
  ];
  const title = product.name;
  function add() {
    if (cart.addItem(product, quantity, variant)) {
      setAdded(true);
      track(shop, 'AddToCart', { value: (variant?.price ?? product.price) * quantity });
    }
  }
  return (
    <main className="wrap shop-main stack-lg" id="main-content">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href={shopPath(shop.slug)}>{shop.name}</Link>
        <span>/</span>
        <Link href={shopPath(shop.slug, '/products')}>Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>
      <div className="product-detail">
        <section className="stack">
          <ProductImage src={image || images[0]} alt={title} priority />
          <div className="row">
            {images.map((url, index) => (
              <button
                type="button"
                className="product-thumb"
                aria-label={`View product image ${index + 1}`}
                aria-pressed={(image || images[0]) === url}
                key={url}
                onClick={() => setImage(url)}
              >
                <ProductImage src={url} />
              </button>
            ))}
          </div>
          {product.videoUrl && (
            <video
              controls
              preload="metadata"
              src={product.videoUrl}
              className="w-full rounded-xl"
              aria-label={`${title} product video`}
            />
          )}
        </section>
        <section className="stack">
          <p className="eyebrow">{product.category || 'Product details'}</p>
          <h1>{title}</h1>
          <strong className="detail-price">
            {money(variant?.price ?? product.price, shop.currency)}
          </strong>
          <p className="muted whitespace-pre-wrap">{product.description}</p>
          {product.material && (
            <p className="fine">
              <strong>Material</strong> {product.material}
            </p>
          )}
          {product.weight > 0 && (
            <p className="fine">
              <strong>Weight</strong> {product.weight} kg
            </p>
          )}
          {product.variants?.length > 0 && (
            <Field label="Choose a variant">
              <select
                value={variantId}
                onChange={(event) => {
                  setVariant(event.target.value);
                  setImage('');
                  setQuantity(1);
                  setAdded(false);
                }}
              >
                {product.variants.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {money(item.price, shop.currency)}
                    {item.stock <= 0 && !product.backorder ? ' · Sold out' : ''}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <p className="fine muted">
            {stock > 0
              ? `${stock} available`
              : product.backorder
                ? 'Available on backorder'
                : 'Out of stock'}
          </p>
          <div className="row">
            <div className="field w-24">
              <input
                aria-label="Quantity"
                min="1"
                max={product.backorder ? 100 : Math.max(1, stock)}
                type="number"
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Math.max(
                      1,
                      Math.min(
                        product.backorder ? 100 : Math.max(1, stock),
                        Number(event.target.value) || 1,
                      ),
                    ),
                  )
                }
              />
            </div>
            <Button disabled={!canBuy} onClick={add}>
              <FiShoppingCart /> {shop.language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to cart'}
            </Button>
            <Button
              tone="secondary"
              onClick={() => favorites.toggle(product.id)}
              aria-pressed={favorites.items.includes(product.id)}
            >
              <FiHeart /> {favorites.items.includes(product.id) ? 'Saved' : 'Save'}
            </Button>
          </div>
          {added && (
            <div className="row">
              <Notice tone="success">Added to your cart.</Notice>
              <Button tone="quiet" href={shopPath(shop.slug, '/cart')}>
                Go to cart <FiArrowRight />
              </Button>
            </div>
          )}
        </section>
      </div>
      <ProductReviews shop={shop} product={product} />
      {related.length > 0 && (
        <section className="stack">
          <h2>More from this store</h2>
          <ProductGrid shop={shop} products={related} />
        </section>
      )}
    </main>
  );
}
function ProductReviews({ shop, product }) {
  const path = shopPath(shop.slug, `/products/${product.id}/reviews`);
  const reviews = useResource(path),
    action = useMutation(reviews.reload);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await action.mutate(path, 'POST', getFields(form), 'Review submitted for moderation.'))
      form.reset();
  }
  return (
    <section className="surface stack">
      <h2>Customer reviews</h2>
      <Resource source={reviews}>
        {(items) =>
          items.length ? (
            items.map((item) => (
              <div className="muted-block" key={item.id}>
                <div className="row between">
                  <strong>{item.name}</strong>
                  <span className="row fine" aria-label={`${item.rating} out of 5`}>
                    <FiStar /> {item.rating}/5
                  </span>
                </div>
                <p>{item.text}</p>
                <small>{dateLabel(item.createdAt)}</small>
              </div>
            ))
          ) : (
            <p className="muted">No published reviews yet.</p>
          )
        }
      </Resource>
      <details>
        <summary className="cursor-pointer font-bold">Review a delivered purchase</summary>
        <form className="fields mt-3" onSubmit={submit}>
          <Field label="Order ID" name="orderId" required />
          <Field
            label="Order access token"
            name="token"
            hint="For a guest order, copy the token from the order link."
          />
          <Field label="Rating">
            <select name="rating" defaultValue="5">
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Review">
            <textarea name="text" minLength={5} required />
          </Field>
          <div className="field-span">
            <Button type="submit" disabled={action.busy}>
              Submit review
            </Button>
          </div>
        </form>
        <div className="mt-3">
          <Feedback action={action} />
        </div>
      </details>
    </section>
  );
}
export function AccountOrders({ shop, user }) {
  const source = useResource(shopPath(shop.slug, '/my-orders'));
  return (
    <main className="wrap shop-main" id="main-content">
      <Heading
        title="My orders"
        eyebrow={shop.name}
        description={`Orders placed while signed in as ${user.email}.`}
      />
      <section className="surface">
        <Resource source={source}>
          {(items) =>
            items.length ? (
              items.map((item) => (
                <div className="detail-row" key={item.id}>
                  <div>
                    <strong>Order #{item.id.slice(-7)}</strong>
                    <p className="fine muted">
                      {dateLabel(item.createdAt)} · {money(item.total, item.currency)} · {item.status}
                    </p>
                  </div>
                  <Button
                    tone="secondary"
                    href={shopPath(shop.slug, `/order-success?order=${item.id}&token=${item.token}`)}
                  >
                    Track order
                  </Button>
                </div>
              ))
            ) : (
              <Empty
                title="No account orders yet"
                description="Sign in before checkout to link future orders to this account."
              />
            )
          }
        </Resource>
      </section>
    </main>
  );
}
