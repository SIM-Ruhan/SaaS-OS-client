'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiActivity,
  FiArrowDownRight,
  FiArrowRight,
  FiArrowUpRight,
  FiBell,
  FiBox,
  FiCreditCard,
  FiGlobe,
  FiGrid,
  FiHelpCircle,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiPlus,
  FiSettings,
  FiShoppingBag,
  FiShoppingCart,
  FiTruck,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import { dateLabel, money, request, shopPath, workspaceLink } from '@/lib/shopos';
import {
  Brand,
  Button,
  Empty,
  Field,
  Heading,
  IconButton,
  Loading,
  Notice,
  Rise,
  Status,
  Table,
} from './ui';

const Workspace = createContext(null);
const groups = [
  [
    'Workspace',
    [
      ['Overview', '/dashboard/seller', FiGrid],
      ['Products', '/dashboard/products', FiPackage],
      ['Orders', '/dashboard/orders', FiShoppingCart],
      ['Customers', '/dashboard/customers', FiUsers],
      ['Analytics', '/dashboard/analytics', FiActivity],
    ],
  ],
  [
    'Growth',
    [
      ['Landing pages', '/dashboard/landing-pages', FiLayers],
      ['Marketing', '/dashboard/marketing', FiArrowDownRight],
      ['Affiliates', '/dashboard/affiliates', FiUsers],
      ['Product research', '/dashboard/research', FiGlobe],
    ],
  ],
  [
    'Manage',
    [
      ['Store settings', '/dashboard/settings', FiSettings],
      ['Payments', '/dashboard/settings/payments', FiCreditCard],
      ['Shipping', '/dashboard/settings/couriers', FiTruck],
      ['Team & billing', '/dashboard/settings/billing', FiBox],
      ['Support', '/dashboard/support', FiHelpCircle],
    ],
  ],
];
export function useResource(path) {
  const [version, setVersion] = useState(0),
    [state, setState] = useState(null);
  useEffect(() => {
    if (!path) return undefined;
    const controller = new AbortController();
    request(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setState({ path, version, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState({ path, version, error: error.message });
      });
    return () => controller.abort();
  }, [path, version]);
  return {
    data: state?.path === path ? state.data : undefined,
    error: state?.path === path ? state.error : undefined,
    pending: !!path && (state?.path !== path || state.version !== version),
    reload: () => setVersion((count) => count + 1),
  };
}
export function useWorkspace() {
  return useContext(Workspace);
}
export function useShopResource(suffix) {
  const { slug } = useWorkspace();
  return useResource(slug && suffix ? shopPath(slug, suffix) : null);
}
export function useMutation(reload) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(null);
  async function mutate(path, method, data, success) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await request(path, { method, data });
      if (success)
        setMessage({ tone: 'success', text: typeof success === 'function' ? success(result) : success });
      reload?.();
      return result;
    } catch (error) {
      setMessage({ tone: 'error', text: error.message });
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { busy, message, mutate, setMessage };
}
export function Feedback({ action }) {
  return <Notice tone={action.message?.tone}>{action.message?.text}</Notice>;
}
export function Resource({ source, children }) {
  if (source.error)
    return (
      <div className="stack">
        <Notice tone="error">{source.error}</Notice>
        <div>
          <Button tone="secondary" onClick={source.reload}>
            Retry
          </Button>
        </div>
      </div>
    );
  if (source.data === undefined) return <Loading />;
  return children(source.data);
}
export function NeedShop({ children }) {
  const { shop, pending, error } = useWorkspace();
  if (pending && !shop) return <Loading label="Loading your stores…" />;
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!shop)
    return (
      <section className="surface">
        <Empty
          title="Create a store to get started"
          description="Your catalog, orders, and settings will appear here."
          icon={FiShoppingBag}
        >
          <Button href="/dashboard/seller/create-shop">
            <FiPlus /> Create store
          </Button>
        </Empty>
      </section>
    );
  return children;
}
export function WorkspaceShell({ children, user, admin }) {
  const pathname = usePathname(),
    router = useRouter(),
    search = useSearchParams();
  const shops = useResource('/my/shops');
  const [menu, setMenu] = useState(false),
    [notices, setNotices] = useState(false);
  const options = useMemo(() => shops.data || [], [shops.data]);
  const shop = options.find((item) => item.slug === search.get('shop')) || options[0] || null;
  const slug = shop?.slug || '';
  const inbox = useResource(slug && notices ? shopPath(slug, '/notifications') : null);
  const canManage = ['owner', 'manager'].includes(shop?.role);
  const context = {
    shop,
    slug,
    shops: options,
    canManage,
    owner: shop?.role === 'owner',
    pending: shops.pending,
    error: shops.error,
    reloadShops: shops.reload,
  };
  function changeShop(event) {
    const query = new URLSearchParams(search.toString());
    query.set('shop', event.target.value);
    query.delete('edit');
    query.delete('checkout');
    router.push(`${pathname}?${query}`);
  }
  async function signOut() {
    await authClient.signOut();
    router.replace('/login');
    router.refresh();
  }
  function navigation() {
    return (
      <nav className="dash-navigation" aria-label="Seller workspace">
        {groups.map(([label, links]) => (
          <div className="nav-group" key={label}>
            <p>{label}</p>
            {links.map(([name, href, Icon]) => {
              const exact = href === '/dashboard/seller' || href === '/dashboard/settings';
              const active = pathname === href || (!exact && pathname.startsWith(`${href}/`));
              return (
                <Link
                  className={`dash-link${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  href={workspaceLink(href, slug)}
                  key={href}
                  onClick={() => setMenu(false)}
                >
                  <Icon aria-hidden="true" />
                  {name}
                </Link>
              );
            })}
          </div>
        ))}
        {admin && (
          <Link className="dash-link" href="/admin">
            <FiSettings /> Platform admin
          </Link>
        )}
      </nav>
    );
  }
  return (
    <Workspace.Provider value={context}>
      <div className="dash-shell">
        <aside className="dash-sidebar">
          <Brand light />
          {navigation()}
          <div className="dash-account">
            <span className="avatar">{user.name?.charAt(0).toUpperCase() || 'S'}</span>
            <div>
              <strong>{user.name || 'Seller'}</strong>
              <small>{user.email}</small>
            </div>
            <button aria-label="Sign out" type="button" onClick={signOut}>
              <FiLogOut />
            </button>
          </div>
        </aside>
        <div className="dash-stage">
          <header className="dash-top">
            <div className="row dash-top-left">
              <button
                className="icon-button dash-mobile-toggle"
                type="button"
                aria-label={menu ? 'Close workspace navigation' : 'Open workspace navigation'}
                aria-expanded={menu}
                onClick={() => setMenu(!menu)}
              >
                {menu ? <FiX /> : <FiMenu />}
              </button>
              <div className="shop-select">
                <FiShoppingBag aria-hidden="true" />
                <select
                  aria-label="Select store"
                  value={slug}
                  onChange={changeShop}
                  disabled={!options.length}
                >
                  {!options.length && <option value="">Your stores</option>}
                  {options.map((item) => (
                    <option value={item.slug} key={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                className="dash-new"
                href="/dashboard/seller/create-shop"
                aria-label="Create store"
                title="Create store"
              >
                <FiPlus />
              </Link>
            </div>
            <div className="row dash-top-right">
              {slug && (
                <Button tone="quiet" href={shopPath(slug)} className="dash-view">
                  View storefront <FiArrowUpRight />
                </Button>
              )}
              <IconButton
                icon={FiBell}
                label="Notifications"
                aria-expanded={notices}
                onClick={() => setNotices(!notices)}
              />
            </div>
          </header>
          <AnimatePresence>
            {menu && (
              <motion.div
                className="mobile-dash-nav"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <Brand light />
                {navigation()}
                <Button tone="lime" onClick={signOut}>
                  <FiLogOut /> Sign out
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {notices && (
              <motion.aside
                className="notification-pop surface"
                aria-label="Notifications"
                initial={{ opacity: 0, y: -7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -7 }}
              >
                <div className="section-title">
                  <h2>Notifications</h2>
                  <IconButton label="Close notifications" icon={FiX} onClick={() => setNotices(false)} />
                </div>
                {slug ? (
                  <Resource source={inbox}>
                    {(items) =>
                      items.length ? (
                        <div className="stack">
                          {items.map((item) => (
                            <div className="muted-block" key={item.id}>
                              <div className="row between">
                                <strong>{item.title}</strong>
                                {!item.read && (
                                  <button
                                    type="button"
                                    className="text-sm underline"
                                    onClick={() =>
                                      request(shopPath(slug, `/notifications/${item.id}`), {
                                        method: 'PATCH',
                                      })
                                        .then(inbox.reload)
                                        .catch(() => null)
                                    }
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                              <p className="fine muted">{item.detail}</p>
                              <small>{dateLabel(item.createdAt)}</small>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Empty title="You’re all caught up" />
                      )
                    }
                  </Resource>
                ) : (
                  <Empty title="Choose a store first" />
                )}
              </motion.aside>
            )}
          </AnimatePresence>
          <main id="main-content" className="dash-content">
            {children}
          </main>
        </div>
      </div>
    </Workspace.Provider>
  );
}
function RevenueChart({ data, currency }) {
  const max = Math.max(1, ...data.map((row) => row.revenue));
  const width = 720,
    height = 180,
    baseline = 151;
  const points = data.map((row, index) => [
    38 + (index * 652) / Math.max(1, data.length - 1),
    baseline - (row.revenue / max) * 112,
  ]);
  const path = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x},${y}`).join(' ');
  const labels = [0, Math.floor((data.length - 1) / 2), data.length - 1];
  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Daily revenue for ${data.length} days in ${currency}`}
      >
        <defs>
          <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8cc80" stopOpacity=".65" />
            <stop offset="100%" stopColor="#e9f2e3" stopOpacity=".15" />
          </linearGradient>
        </defs>
        {[39, 76, 113, 151].map((y) => (
          <line key={y} x1="38" x2="690" y1={y} y2={y} stroke="#dce4db" strokeDasharray="4 4" />
        ))}
        {points.length > 0 && (
          <>
            <path
              d={`${path} L${points.at(-1)[0]},${baseline} L38,${baseline} Z`}
              fill="url(#revenue-fill)"
            />
            <path d={path} fill="none" stroke="#366c50" strokeWidth="3" strokeLinejoin="round" />
          </>
        )}
        {labels.map(
          (index) =>
            data[index] && (
              <text
                key={index}
                x={points[index][0]}
                y="173"
                textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'}
                fill="#53625b"
                fontSize="12"
              >
                {data[index].date.slice(5)}
              </text>
            ),
        )}
      </svg>
    </div>
  );
}
export function Overview({ analyticsOnly = false }) {
  const { shop, slug } = useWorkspace();
  const [days, setDays] = useState('30');
  const source = useShopResource(`/analytics?days=${days}`);
  return (
    <>
      <Heading
        eyebrow={analyticsOnly ? 'Performance' : 'Workspace'}
        title={analyticsOnly ? 'Store analytics' : shop ? `${shop.name} overview` : 'Your stores'}
        description={
          analyticsOnly
            ? 'Revenue, traffic, and landing page performance from this store.'
            : 'Review sales and take care of the work waiting in your store.'
        }
        actions={
          <>
            <Button tone="secondary" href="/dashboard/seller/create-shop">
              <FiPlus /> New store
            </Button>
            {shop && (
              <Button href={workspaceLink('/dashboard/products/new', slug)}>
                <FiPlus /> Add product
              </Button>
            )}
          </>
        }
      />
      <NeedShop>
        <Resource source={source}>
          {(data) => (
            <div className="stack-lg">
              <div className="grid-4">
                {[
                  ['Revenue', money(data.revenue, data.currency), FiCreditCard, 'Verified payments'],
                  ['Orders', data.orders, FiShoppingCart, `${data.openOrders} open`],
                  ['Sessions', data.sessions, FiActivity, 'Visitors who allowed analytics'],
                  [
                    'Conversion rate',
                    data.conversionRate === null ? '—' : `${data.conversionRate.toFixed(1)}%`,
                    FiArrowUpRight,
                    'Measured sessions',
                  ],
                ].map(([label, value, Icon, note], index) => (
                  <Rise className="surface metric" delay={index * 0.045} key={label}>
                    <div className="row between">
                      <span>{label}</span>
                      <span className="metric-icon">
                        <Icon aria-hidden="true" />
                      </span>
                    </div>
                    <strong>{value}</strong>
                    <small>{note}</small>
                  </Rise>
                ))}
              </div>
              <section className="surface">
                <div className="section-title">
                  <div>
                    <h2>Revenue over time</h2>
                    <p className="muted fine">Paid orders in {data.currency}</p>
                  </div>
                  <label className="row fine">
                    <span className="muted">Period</span>
                    <select
                      className="standalone-select"
                      style={{ width: 'auto' }}
                      value={days}
                      onChange={(event) => setDays(event.target.value)}
                    >
                      {[7, 14, 30, 90].map((value) => (
                        <option key={value} value={value}>
                          Last {value} days
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <RevenueChart data={data.series} currency={data.currency} />
                {data.limited && (
                  <Notice tone="warn">
                    Choose a shorter period to see more complete results for this store.
                  </Notice>
                )}
              </section>
              <div className="grid-2">
                <section className="surface">
                  <div className="section-title">
                    <h2>Top products</h2>
                    <Link className="external" href={workspaceLink('/dashboard/products', slug)}>
                      Catalog <FiArrowRight />
                    </Link>
                  </div>
                  {data.topProducts.length ? (
                    data.topProducts.map((item) => (
                      <div className="detail-row" key={item.id}>
                        <span>
                          {item.name}
                          <small className="block">{item.units} units sold</small>
                        </span>
                        <strong>{money(item.revenue, data.currency)}</strong>
                      </div>
                    ))
                  ) : (
                    <Empty title="No paid product sales yet" />
                  )}
                </section>
                <section className="surface">
                  <div className="section-title">
                    <h2>Customer activity</h2>
                    <Link className="external" href={workspaceLink('/dashboard/customers', slug)}>
                      Customers <FiArrowRight />
                    </Link>
                  </div>
                  <div className="detail-row">
                    <span>Customers</span>
                    <strong>{data.customers}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Repeat customers</span>
                    <strong>{data.repeatCustomers}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Paid orders</span>
                    <strong>{data.paidOrders}</strong>
                  </div>
                </section>
              </div>
              {analyticsOnly && <AnalyticsDetails data={data} reload={source.reload} />}
            </div>
          )}
        </Resource>
      </NeedShop>
    </>
  );
}
function AnalyticsDetails({ data, reload }) {
  const { slug, canManage } = useWorkspace();
  const action = useMutation(reload);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (
      await action.mutate(
        shopPath(slug, '/analytics/spend'),
        'POST',
        Object.fromEntries(new FormData(form)),
        'Ad spend saved.',
      )
    )
      form.reset();
  }
  return (
    <>
      <section className="surface stack">
        <h2>Acquisition channels</h2>
        <Table
          columns={['Channel', 'Sessions', 'Orders', 'Tracked revenue', 'Ad spend', 'ROAS']}
          rows={data.channels.map((row) => ({ ...row, id: row.channel }))}
          empty="No consented channel activity yet"
          render={(row) => (
            <>
              <td>{row.channel}</td>
              <td>{row.sessions}</td>
              <td>{row.orders}</td>
              <td>{money(row.revenue, data.currency)}</td>
              <td>{money(row.spend, data.currency)}</td>
              <td>{row.roas === null ? '—' : `${row.roas.toFixed(2)}×`}</td>
            </>
          )}
        />
        {canManage && (
          <form className="fields fields-3" onSubmit={submit}>
            <Field label="Channel">
              <select name="channel">
                {[
                  'facebook',
                  'instagram',
                  'google',
                  'tiktok',
                  'email',
                  'affiliate',
                  'referral',
                  'direct',
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Date" name="date" type="date" required />
            <Field
              label={`Ad spend (${data.currency})`}
              name="amount"
              type="number"
              min="0"
              step=".01"
              required
            />
            <div className="field-span row">
              <Button type="submit" disabled={action.busy}>
                Save spend
              </Button>
              <Feedback action={action} />
            </div>
          </form>
        )}
      </section>
      <section className="surface stack">
        <h2>Landing page A/B results</h2>
        <Table
          columns={['Page', 'Variant', 'Visitors', 'Purchases', 'Conversion']}
          rows={data.variants.map((row) => ({ ...row, id: `${row.page}:${row.variant}` }))}
          empty="No measured landing page traffic yet"
          render={(row) => (
            <>
              <td>{row.page}</td>
              <td>{row.variant.toUpperCase()}</td>
              <td>{row.visitors}</td>
              <td>{row.purchases}</td>
              <td>{row.visitors ? `${((row.purchases / row.visitors) * 100).toFixed(1)}%` : '—'}</td>
            </>
          )}
        />
      </section>
    </>
  );
}
export function Customers() {
  const source = useShopResource('/customers');
  return (
    <>
      <Heading
        eyebrow="Sales"
        title="Customers"
        description="Order history by customer, based on the contact details supplied at checkout."
      />
      <NeedShop>
        <section className="surface">
          <Resource source={source}>
            {(data) => (
              <Table
                columns={['Customer', 'Contact', 'Orders', 'Paid total', 'Last order']}
                rows={data.customers}
                render={(item) => (
                  <>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{item.email || item.phone}</td>
                    <td>{item.orders}</td>
                    <td>{money(item.paid, data.currency)}</td>
                    <td>{dateLabel(item.lastOrder)}</td>
                  </>
                )}
              />
            )}
          </Resource>
        </section>
      </NeedShop>
    </>
  );
}
