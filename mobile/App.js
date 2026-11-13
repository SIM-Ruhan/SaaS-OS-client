import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';

const base = (process.env.EXPO_PUBLIC_SHOPOS_URL || '').replace(/\/$/, '');
const tokenKey = 'shopos.session';
const colors = {
  ink: '#172923',
  green: '#173d31',
  lime: '#d9ee9d',
  muted: '#53625b',
  border: '#dce4db',
  background: '#f5f6f0',
  white: '#ffffff',
  red: '#922e25',
};
const labels = {
  cod: 'Cash on delivery',
  sslcommerz: 'SSLCommerz',
  stripe: 'Stripe card',
  paypal: 'PayPal',
  aamarpay: 'aamarPay',
  bkash: 'bKash',
  shurjopay: 'shurjoPay',
};
const money = (amount, currency = 'BDT') => `${currency} ${Number(amount || 0).toFixed(2)}`;
async function readToken() {
  return Platform.OS === 'web'
    ? sessionStorage.getItem(tokenKey)
    : await SecureStore.getItemAsync(tokenKey);
}
async function saveToken(token) {
  if (Platform.OS === 'web') {
    if (token) sessionStorage.setItem(tokenKey, token);
    else sessionStorage.removeItem(tokenKey);
  } else if (token) await SecureStore.setItemAsync(tokenKey, token);
  else await SecureStore.deleteItemAsync(tokenKey);
}
async function api(path, { method = 'GET', data, token, auth = false } = {}) {
  if (!base) throw new Error('Set EXPO_PUBLIC_SHOPOS_URL in mobile/.env and restart Expo.');
  const response = await fetch(`${base}${auth ? '/api/auth' : '/api/shopos'}${path}`, {
    method,
    headers: {
      ...(data === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  return { payload, token: response.headers.get('set-auth-token') };
}
function useData(path, token) {
  const [state, setState] = useState({}),
    [version, setVersion] = useState(0);
  useEffect(() => {
    if (!path || !base) return;
    let current = true;
    api(path, { token })
      .then((result) => {
        if (current) setState({ path, token, version, data: result.payload });
      })
      .catch((error) => {
        if (current) setState({ path, token, version, error: error.message });
      });
    return () => {
      current = false;
    };
  }, [path, token, version]);
  return {
    ...(state.path === path && state.token === token ? state : {}),
    pending:
      !!path && !!base && (state.path !== path || state.token !== token || state.version !== version),
    reload: () => setVersion((value) => value + 1),
  };
}
function Button({ label, onPress, secondary, disabled, danger }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        danger && styles.danger,
        (pressed || disabled) && styles.dim,
      ]}
    >
      <Text
        style={[styles.buttonLabel, secondary && styles.secondaryLabel, danger && styles.dangerLabel]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
function Field({ label, value, onChange, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        value={String(value ?? '')}
        onChangeText={onChange}
        style={styles.input}
        {...props}
      />
    </View>
  );
}
function Message({ children, error }) {
  return children ? (
    <Text accessibilityLiveRegion="polite" style={[styles.message, error && styles.error]}>
      {children}
    </Text>
  ) : null;
}
function State({ data, children, empty }) {
  if (data.error)
    return (
      <View style={styles.card}>
        <Message error>{data.error}</Message>
        <Button secondary label="Retry" onPress={data.reload} />
      </View>
    );
  if (data.pending && data.data === undefined)
    return <ActivityIndicator color={colors.green} accessibilityLabel="Loading" />;
  if (data.data === undefined) return empty ? <Message>{empty}</Message> : null;
  return children(data.data);
}
function Cover({ uri }) {
  return uri ? (
    <Image
      alt=""
      source={{ uri }}
      accessibilityIgnoresInvertColors
      style={styles.cover}
      resizeMode="cover"
    />
  ) : (
    <View style={styles.placeholder}>
      <Text style={styles.label}>ShopOS</Text>
    </View>
  );
}
const paths = (slug, suffix = '') => `/shops/${encodeURIComponent(slug)}${suffix}`;
const openUrl = (url) =>
  Platform.OS === 'web' ? Linking.openURL(url) : WebBrowser.openBrowserAsync(url);
function Home({ open }) {
  const data = useData('/shops?limit=60');
  return (
    <>
      <Text style={styles.kicker}>SHOPS</Text>
      <Text style={styles.h1}>Shop independently.</Text>
      <Text style={styles.copy}>Browse stores, choose products, and track your orders.</Text>
      {!base && (
        <Message error>
          Set EXPO_PUBLIC_SHOPOS_URL to your deployed ShopOS client to load stores.
        </Message>
      )}
      <State data={data}>
        {(items) =>
          items.length ? (
            items.map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                onPress={() => open(item.slug)}
                style={styles.storeRow}
              >
                <View style={styles.mark}>
                  <Text style={styles.markText}>{item.name.slice(0, 1)}</Text>
                </View>
                <View style={styles.grow}>
                  <Text style={styles.h3}>{item.name}</Text>
                  {item.description ? (
                    <Text numberOfLines={2} style={styles.copy}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.link}>View</Text>
              </Pressable>
            ))
          ) : (
            <Message>No shops listed yet.</Message>
          )
        }
      </State>
    </>
  );
}
function Store({ slug, open, back }) {
  const data = useData(paths(slug)),
    products = useData(paths(slug, '/products?limit=80'));
  return (
    <>
      <Button secondary label="All shops" onPress={back} />
      <State data={data}>
        {(shop) => (
          <>
            <Text style={styles.h1}>{shop.name}</Text>
            {shop.description ? <Text style={styles.copy}>{shop.description}</Text> : null}
            <Text style={styles.h2}>Products</Text>
            <State data={products}>
              {(items) =>
                items.length ? (
                  <View style={styles.grid}>
                    {items.map((item) => (
                      <Pressable
                        accessibilityRole="button"
                        key={item.id}
                        style={styles.product}
                        onPress={() => open(item.id)}
                      >
                        <Cover uri={item.imageUrl} />
                        <Text style={styles.h3} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.label}>{money(item.price, shop.currency)}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <Message>No products yet.</Message>
                )
              }
            </State>
          </>
        )}
      </State>
    </>
  );
}
function Product({ slug, id, add, back, cart }) {
  const source = useData(paths(slug, `/products/${id}`)),
    shop = useData(paths(slug));
  const [variantId, setVariant] = useState(''),
    [quantity, setQuantity] = useState('1'),
    [added, setAdded] = useState(false);
  return (
    <>
      <Button secondary label="Back to store" onPress={back} />
      <State data={source}>
        {(item) => {
          const variant = item.variants?.find((entry) => entry.id === variantId) || item.variants?.[0];
          const stock = variant?.stock ?? item.stock;
          return (
            <>
              <Cover uri={variant?.imageUrl || item.imageUrl} />
              <Text style={styles.h1}>{item.name}</Text>
              <Text style={styles.h2}>{money(variant?.price ?? item.price, shop.data?.currency)}</Text>
              <Text style={styles.copy}>{item.description}</Text>
              {item.variants?.length > 0 && (
                <View style={styles.wrap}>
                  {item.variants.map((entry) => (
                    <Button
                      key={entry.id}
                      secondary={entry.id !== variant?.id}
                      label={entry.name}
                      onPress={() => setVariant(entry.id)}
                    />
                  ))}
                </View>
              )}
              <Field
                label="Quantity"
                value={quantity}
                onChange={setQuantity}
                keyboardType="number-pad"
              />
              <Button
                label={stock > 0 || item.backorder ? 'Add to cart' : 'Out of stock'}
                disabled={stock <= 0 && !item.backorder}
                onPress={() => {
                  add(
                    slug,
                    item,
                    variant,
                    Math.min(
                      item.backorder ? 100 : stock,
                      Math.max(1, Number.parseInt(quantity, 10) || 1),
                    ),
                  );
                  setAdded(true);
                }}
              />
              {added && <Button secondary label="Open cart" onPress={cart} />}
            </>
          );
        }}
      </State>
    </>
  );
}
function Cart({ slug, items, update, token, user, onOrder, back }) {
  const settings = useData(slug ? paths(slug) : null);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    country: '',
    currency: '',
    discountCode: '',
  });
  const [quote, setQuote] = useState(null),
    [method, setMethod] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(null);
  const set = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setQuote(null);
    setRetry(null);
  };
  async function checkout(shop) {
    if (busy) return;
    setBusy(true);
    setError('');
    const data = {
      customer: { ...form, country: form.country || shop.country },
      items: items.map(({ id, variantId, qty }) => ({ id, variantId, qty })),
      currency: form.currency || shop.currency,
      discountCode: form.discountCode,
    };
    try {
      if (!quote) {
        const next = (await api(paths(slug, '/checkout/quote'), { method: 'POST', data, token }))
          .payload;
        setQuote(next);
        setMethod(next.payments[0] || '');
        return;
      }
      const checkoutKey = retry?.key || Crypto.randomUUID();
      if (!retry) setRetry({ key: checkoutKey });
      const order =
        retry?.order ||
        (
          await api(paths(slug, '/orders'), {
            method: 'POST',
            token,
            data: { ...data, shippingId: quote.shippingId, paymentMethod: method, checkoutKey },
          })
        ).payload;
      setRetry({ key: checkoutKey, order });
      if (order.paymentMethod !== 'cod' && order.paymentStatus === 'pending') {
        const result = (
          await api(paths(slug, `/orders/${order.id}/pay`), {
            method: 'POST',
            data: { token: order.token },
            token,
          })
        ).payload;
        await openUrl(result.url);
      }
      onOrder(order);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Text style={styles.h1}>Your cart</Text>
      {!items.length ? (
        <>
          <Message>Your cart is empty.</Message>
          <Button secondary label="Browse shops" onPress={back} />
        </>
      ) : (
        <State data={settings}>
          {(shop) => (
            <>
              {items.map((item) => (
                <View style={styles.card} key={item.key}>
                  <Text style={styles.h3}>{item.name}</Text>
                  <Text style={styles.copy}>
                    {item.variantName ? `${item.variantName} · ` : ''}
                    {money(item.price, shop.currency)}
                  </Text>
                  <View style={styles.wrap}>
                    <Button
                      secondary
                      label="−"
                      onPress={() => {
                        update(item.key, item.qty - 1);
                        setQuote(null);
                        setRetry(null);
                      }}
                    />
                    <Text style={styles.label}>{item.qty}</Text>
                    <Button
                      secondary
                      label="+"
                      disabled={item.qty >= item.max}
                      onPress={() => {
                        update(item.key, item.qty + 1);
                        setQuote(null);
                        setRetry(null);
                      }}
                    />
                  </View>
                </View>
              ))}
              <View style={styles.card}>
                <Text style={styles.h2}>Delivery and payment</Text>
                {[
                  ['name', 'Full name'],
                  ['phone', 'Phone'],
                  ['email', 'Email address'],
                  ['address', 'Street address'],
                  ['city', 'City'],
                  ['postcode', 'Postal code'],
                  ['country', 'Country code'],
                  ['currency', 'Currency'],
                  ['discountCode', 'Discount code'],
                ].map(([key, label]) => (
                  <Field
                    key={key}
                    label={label}
                    value={form[key]}
                    onChange={(value) =>
                      set(key, key === 'country' || key === 'currency' ? value.toUpperCase() : value)
                    }
                    placeholder={
                      key === 'country' ? shop.country : key === 'currency' ? shop.currency : undefined
                    }
                    keyboardType={
                      key === 'email' ? 'email-address' : key === 'phone' ? 'phone-pad' : 'default'
                    }
                    autoCapitalize={key === 'email' ? 'none' : undefined}
                  />
                ))}
                {quote && (
                  <>
                    <Text style={styles.h3}>Total {money(quote.total, quote.currency)}</Text>
                    <Text style={styles.copy}>
                      Delivery {money(quote.shipping, quote.currency)} · Discount{' '}
                      {money(quote.discount, quote.currency)}
                    </Text>
                    {quote.payments.length ? (
                      <View style={styles.wrap}>
                        {quote.payments.map((item) => (
                          <Button
                            key={item}
                            disabled={!!retry?.order}
                            secondary={method !== item}
                            label={labels[item] || item}
                            onPress={() => {
                              setMethod(item);
                              setRetry(null);
                            }}
                          />
                        ))}
                      </View>
                    ) : (
                      <Message error>No payment method is available for this address.</Message>
                    )}
                  </>
                )}
                <Message error>{error}</Message>
                <Button
                  label={
                    busy
                      ? 'Working…'
                      : quote
                        ? retry
                          ? 'Retry checkout'
                          : 'Place order'
                        : 'Review order'
                  }
                  disabled={busy || (!!quote && !method)}
                  onPress={() => checkout(shop)}
                />
              </View>
            </>
          )}
        </State>
      )}
    </>
  );
}
function Receipt({ order, token, back }) {
  const source = useData(
    paths(order.shopSlug, `/orders/${order.id}/status?token=${encodeURIComponent(order.token)}`),
    token,
  );
  const current = source.data || order;
  return (
    <>
      <Text style={styles.h1}>Order #{order.id.slice(-7)}</Text>
      <View style={styles.card}>
        <Text style={styles.h3}>{money(current.total, current.currency)}</Text>
        <Text style={styles.copy}>
          Order {current.status} · Payment {current.paymentStatus.replaceAll('_', ' ')}
        </Text>
        {current.courier?.trackingCode && (
          <Text style={styles.copy}>Tracking {current.courier.trackingCode}</Text>
        )}
        {current.courier?.trackingUrl && (
          <Button
            secondary
            label="Open courier tracking"
            onPress={() => openUrl(current.courier.trackingUrl)}
          />
        )}
        <Button secondary label="Refresh status" onPress={source.reload} />
        <Message error>{source.error}</Message>
      </View>
      <Button label="Continue shopping" onPress={back} />
    </>
  );
}
function Account({ user, token, setUser, signOut, lastOrder, openOrder, seller, slug }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' }),
    [mode, setMode] = useState('sign-in'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const orders = useData(user && slug ? paths(slug, '/my-orders') : null, token);
  async function submit() {
    setBusy(true);
    setError('');
    try {
      const response = await api(`/${mode}/email`, {
        method: 'POST',
        data: {
          email: form.email,
          password: form.password,
          ...(mode === 'sign-up' ? { name: form.name, ...(slug ? { shopSlug: slug } : {}) } : {}),
        },
        auth: true,
      });
      if (!response.token || !response.payload.user)
        throw new Error(
          'The server did not return a mobile session. Check your account and sign in again.',
        );
      await saveToken(response.token);
      setUser(response.payload.user, response.token);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Text style={styles.h1}>Account</Text>
      {user ? (
        <>
          <View style={styles.card}>
            <Text style={styles.h2}>{user.name}</Text>
            <Text style={styles.copy}>{user.email}</Text>
            <Button label="Seller workspace" onPress={seller} />
            <Button secondary label="Sign out" onPress={signOut} />
          </View>
          {slug && (
            <>
              <Text style={styles.h2}>Orders from this store</Text>
              <State data={orders}>
                {(items) =>
                  items.length ? (
                    items.map((order) => (
                      <Button
                        key={order.id}
                        secondary
                        label={`#${order.id.slice(-7)} · ${money(order.total, order.currency)}`}
                        onPress={() => openOrder(order)}
                      />
                    ))
                  ) : (
                    <Message>No orders for this account at this store.</Message>
                  )
                }
              </State>
            </>
          )}
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.h2}>{mode === 'sign-in' ? 'Sign in' : 'Create an account'}</Text>
          {mode === 'sign-up' && (
            <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          )}
          <Field
            label="Email address"
            value={form.email}
            onChange={(email) => setForm({ ...form, email })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Password"
            value={form.password}
            onChange={(password) => setForm({ ...form, password })}
            secureTextEntry
          />
          <Message error>{error}</Message>
          <Button
            label={busy ? 'Working…' : mode === 'sign-in' ? 'Sign in' : 'Register'}
            onPress={submit}
            disabled={busy}
          />
          <Button
            secondary
            label={mode === 'sign-in' ? 'Create an account' : 'Back to sign in'}
            onPress={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
          />
        </View>
      )}
      {lastOrder && (
        <Button
          secondary
          label={`Track order #${lastOrder.id.slice(-7)}`}
          onPress={() => openOrder(lastOrder)}
        />
      )}
    </>
  );
}
function Seller({ token, back }) {
  const stores = useData('/my/shops', token),
    [selected, setSelected] = useState('');
  const slug = selected || stores.data?.[0]?.slug;
  const analytics = useData(slug ? paths(slug, '/analytics?days=30') : null, token),
    orders = useData(slug ? paths(slug, '/orders?limit=10') : null, token),
    products = useData(slug ? paths(slug, '/products?all=1&limit=15') : null, token);
  const [error, setError] = useState(''),
    [working, setWorking] = useState('');
  async function change(order, status) {
    setWorking(order.id);
    setError('');
    try {
      await api(paths(slug, `/orders/${order.id}`), { method: 'PATCH', token, data: { status } });
      orders.reload();
      analytics.reload();
    } catch (error) {
      setError(error.message);
    } finally {
      setWorking('');
    }
  }
  return (
    <>
      <Button secondary label="Back to account" onPress={back} />
      <Text style={styles.h1}>Seller workspace</Text>
      <State data={stores}>
        {(items) =>
          items.length ? (
            <View style={styles.wrap}>
              {items.map((item) => (
                <Button
                  key={item.id}
                  secondary={slug !== item.slug}
                  label={item.name}
                  onPress={() => setSelected(item.slug)}
                />
              ))}
            </View>
          ) : (
            <>
              <Message>Create your first shop in the web dashboard.</Message>
              <Button
                label="Open ShopOS dashboard"
                onPress={() => openUrl(`${base}/dashboard/seller/create-shop`)}
              />
            </>
          )
        }
      </State>
      {slug && (
        <>
          <State data={analytics}>
            {(data) => (
              <View style={styles.grid}>
                {[
                  ['Revenue', money(data.revenue, data.currency)],
                  ['Orders', data.orders],
                  ['Sessions', data.sessions],
                  ['Customers', data.customers],
                ].map(([label, value]) => (
                  <View key={label} style={styles.metric}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.h3}>{value}</Text>
                  </View>
                ))}
              </View>
            )}
          </State>
          <Text style={styles.h2}>Recent orders</Text>
          <Message error>{error}</Message>
          <State data={orders}>
            {(items) =>
              items.length ? (
                items.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <Text style={styles.h3}>
                      #{item.id.slice(-7)} · {item.customer.name}
                    </Text>
                    <Text style={styles.copy}>
                      {money(item.total, item.currency)} · {item.status} ·{' '}
                      {item.paymentStatus.replaceAll('_', ' ')}
                    </Text>
                    {(item.paymentMethod === 'cod' || item.paymentStatus === 'paid') &&
                      { pending: 'confirmed', confirmed: 'shipped', shipped: 'delivered' }[
                        item.status
                      ] && (
                        <Button
                          secondary
                          disabled={working === item.id}
                          label={`Mark ${{ pending: 'confirmed', confirmed: 'shipped', shipped: 'delivered' }[item.status]}`}
                          onPress={() =>
                            change(
                              item,
                              { pending: 'confirmed', confirmed: 'shipped', shipped: 'delivered' }[
                                item.status
                              ],
                            )
                          }
                        />
                      )}
                  </View>
                ))
              ) : (
                <Message>No orders yet.</Message>
              )
            }
          </State>
          <Text style={styles.h2}>Catalog</Text>
          <State data={products}>
            {(items) =>
              items.length ? (
                items.map((item) => (
                  <View style={styles.storeRow} key={item.id}>
                    <Text style={[styles.h3, styles.grow]}>{item.name}</Text>
                    <Text style={styles.label}>
                      {item.variants?.length
                        ? item.variants.reduce((sum, variant) => sum + variant.stock, 0)
                        : item.stock}{' '}
                      in stock
                    </Text>
                  </View>
                ))
              ) : (
                <Message>No products yet.</Message>
              )
            }
          </State>
          <Button
            secondary
            label="Open full web workspace"
            onPress={() => openUrl(`${base}/dashboard/seller?shop=${encodeURIComponent(slug)}`)}
          />
        </>
      )}
    </>
  );
}
function Main() {
  const [screen, setScreen] = useState({ name: 'home' }),
    [token, setToken] = useState(null),
    [user, setUser] = useState(null),
    [slug, setSlug] = useState(null),
    [cart, setCart] = useState({ slug: null, items: [] }),
    [lastOrder, setLastOrder] = useState(null);
  useEffect(() => {
    let current = true;
    if (base)
      readToken()
        .then(async (value) => {
          if (!value) return;
          const result = await api('/get-session', { auth: true, token: value });
          if (current && result.payload?.user) {
            setToken(value);
            setUser(result.payload.user);
          }
        })
        .catch(() => null);
    return () => {
      current = false;
    };
  }, []);
  function add(slug, product, variant, qty) {
    const key = `${product.id}:${variant?.id || ''}`,
      max = product.backorder ? 100 : Math.max(1, variant?.stock ?? product.stock);
    setCart((previous) => {
      const rows = previous.slug === slug ? previous.items : [];
      return {
        slug,
        items: [
          ...rows.filter((item) => item.key !== key),
          {
            key,
            id: product.id,
            variantId: variant?.id,
            variantName: variant?.name,
            name: product.name,
            price: variant?.price ?? product.price,
            max,
            qty: Math.min(max, (rows.find((item) => item.key === key)?.qty || 0) + qty),
          },
        ],
      };
    });
  }
  function update(key, qty) {
    setCart((previous) => ({
      ...previous,
      items: previous.items.flatMap((item) =>
        item.key !== key ? [item] : qty > 0 ? [{ ...item, qty: Math.min(qty, item.max) }] : [],
      ),
    }));
  }
  function order(item) {
    setLastOrder(item);
    if (item.paymentMethod === 'cod' || item.paymentStatus === 'paid')
      setCart({ slug: null, items: [] });
    setScreen({ name: 'receipt', order: item });
  }
  const openShop = (value) => {
    setSlug(value);
    setScreen({ name: 'store' });
  };
  const home = () => setScreen({ name: 'home' });
  const shopping = () => (slug ? openShop(slug) : home());
  const account = () => setScreen({ name: 'account' });
  const openCart = () => setScreen({ name: 'cart' });
  async function signOut() {
    try {
      await api('/sign-out', { method: 'POST', auth: true, token });
    } catch {
      /* Local sign-out still clears the credential. */
    }
    await saveToken(null);
    setToken(null);
    setUser(null);
  }
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ShopOS home"
          onPress={home}
          style={styles.brand}
        >
          <Image alt="" source={require('./assets/icon.png')} style={styles.logo} />
          <Text style={styles.brandText}>ShopOS</Text>
        </Pressable>
        <Text style={styles.copy}>{user ? user.name?.split(' ')[0] : 'Commerce'}</Text>
      </View>
      <ScrollView
        key={screen.name}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {screen.name === 'home' && <Home open={openShop} />}
        {screen.name === 'store' && (
          <Store slug={slug} back={home} open={(id) => setScreen({ name: 'product', id })} />
        )}
        {screen.name === 'product' && (
          <Product slug={slug} id={screen.id} add={add} back={shopping} cart={openCart} />
        )}
        {screen.name === 'cart' && (
          <Cart
            key={cart.slug}
            slug={cart.slug}
            items={cart.items}
            update={update}
            token={token}
            user={user}
            onOrder={order}
            back={home}
          />
        )}
        {screen.name === 'account' && (
          <Account
            user={user}
            token={token}
            slug={slug}
            setUser={(next, value) => {
              setUser(next);
              setToken(value);
            }}
            signOut={signOut}
            lastOrder={lastOrder}
            openOrder={(item) => setScreen({ name: 'receipt', order: item })}
            seller={() => setScreen({ name: 'seller' })}
          />
        )}
        {screen.name === 'receipt' && <Receipt order={screen.order} token={token} back={shopping} />}
        {screen.name === 'seller' && <Seller token={token} back={account} />}
      </ScrollView>
      <View style={styles.nav}>
        {[
          ['Shops', home, ['home', 'store', 'product'].includes(screen.name)],
          [
            `Cart (${cart.items.reduce((sum, item) => sum + item.qty, 0)})`,
            openCart,
            screen.name === 'cart',
          ],
          ['Account', account, ['account', 'seller', 'receipt'].includes(screen.name)],
        ].map(([label, action, active]) => (
          <Pressable
            key={label.split(' ')[0]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={action}
            style={[styles.navItem, active && styles.navActive]}
          >
            <Text style={styles.label}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 19,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  logo: { width: 35, height: 35, borderRadius: 9 },
  brandText: { fontSize: 23, fontWeight: '800', letterSpacing: -1.1, color: colors.ink },
  content: {
    padding: 18,
    gap: 14,
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    paddingBottom: 30,
  },
  kicker: { color: colors.green, fontWeight: '800', fontSize: 12, letterSpacing: 1.7 },
  h1: { color: colors.ink, fontSize: 34, fontWeight: '800', letterSpacing: -1.7 },
  h2: { color: colors.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.6 },
  h3: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  button: {
    backgroundColor: colors.green,
    paddingHorizontal: 15,
    paddingVertical: 11,
    minHeight: 46,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.green,
  },
  buttonLabel: { color: colors.white, fontWeight: '800', fontSize: 14, textAlign: 'center' },
  secondary: { backgroundColor: colors.white, borderColor: colors.border },
  secondaryLabel: { color: colors.green },
  danger: { backgroundColor: '#fcece5', borderColor: '#e2bdb0' },
  dangerLabel: { color: colors.red },
  dim: { opacity: 0.58 },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    gap: 12,
  },
  storeRow: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 58,
  },
  mark: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { fontSize: 20, fontWeight: '800', color: colors.green },
  grow: { flex: 1 },
  link: { color: colors.green, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  product: {
    flexBasis: '47%',
    flexGrow: 1,
    maxWidth: '50%',
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cover: { width: '100%', aspectRatio: 1.22, borderRadius: 11, backgroundColor: '#e3eee1' },
  placeholder: {
    width: '100%',
    aspectRatio: 1.22,
    borderRadius: 11,
    backgroundColor: '#e3eee1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metric: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 13,
    backgroundColor: colors.white,
    gap: 4,
  },
  field: { gap: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#b5c6b9',
    borderRadius: 9,
    minHeight: 46,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  message: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#e8f1e5',
    color: colors.green,
    fontSize: 14,
  },
  error: { backgroundColor: '#fcece5', color: colors.red },
  wrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 7,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  navItem: {
    minHeight: 47,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginHorizontal: 3,
  },
  navActive: { backgroundColor: colors.lime },
});
