'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FiCreditCard,
  FiExternalLink,
  FiGlobe,
  FiPlus,
  FiSettings,
  FiTrash2,
  FiTruck,
  FiUsers,
} from 'react-icons/fi';
import {
  Button,
  Empty,
  External,
  Field,
  Heading,
  IconButton,
  Notice,
  Status,
  Table,
  Toggle,
} from './ui';
import { StoreContent } from './store-content';
import { Feedback, NeedShop, Resource, useMutation, useShopResource, useWorkspace } from './workspace';
import { currencies, dateLabel, getFields, money, request, shopPath, workspaceLink } from '@/lib/shopos';

const info = {
  sslcommerz: [
    'SSLCommerz',
    'Hosted checkout for Bangladesh. Use the store ID and store password from your merchant account.',
    ['storeId', 'storePassword', 'sandbox'],
  ],
  stripe: [
    'Stripe card payments',
    'Connect a merchant account for card payments, or enter your own Stripe keys.',
    ['secretKey', 'webhookSecret'],
  ],
  paypal: [
    'PayPal',
    'PayPal Orders API checkout for supported international currencies.',
    ['clientId', 'clientSecret', 'sandbox'],
  ],
  aamarpay: [
    'aamarPay',
    'Hosted checkout for Bangladesh. Use a merchant store ID and signature key.',
    ['storeId', 'signature', 'sandbox'],
  ],
  bkash: [
    'bKash',
    'Direct wallet checkout using bKash merchant tokenized checkout credentials.',
    ['appKey', 'appSecret', 'username', 'password', 'sandbox'],
  ],
  shurjopay: [
    'shurjoPay',
    'Hosted Bangladesh checkout using the merchant username, password, and prefix.',
    ['username', 'password', 'prefix', 'sandbox'],
  ],
  redx: [
    'RedX',
    'Submit Bangladesh consignments with an Open API token and pickup store ID.',
    ['token', 'storeId', 'sandbox'],
  ],
  steadfast: [
    'Steadfast',
    'Create and track local COD or prepaid consignments.',
    ['apiKey', 'secretKey'],
  ],
  pathao: [
    'Pathao Courier',
    'Submit deliveries by city and zone. Use the merchant API credentials and store ID.',
    ['clientId', 'clientSecret', 'username', 'password', 'storeId', 'sandbox'],
  ],
  shippo: ['Shippo', 'Compare carrier rates and purchase labels for prepaid shipments.', ['token']],
  meta: [
    'Meta Conversions API',
    'Send consented events from the server. Browser events share the same event ID.',
    ['pixelId', 'token', 'testCode'],
  ],
  tiktok: [
    'TikTok Events API',
    'Send consented storefront events to your TikTok pixel.',
    ['pixelId', 'token', 'testCode'],
  ],
  google: [
    'Google server-side tagging',
    'Use a GA4 Measurement Protocol endpoint or a compatible server-side tagging client.',
    ['measurementId', 'endpoint', 'apiSecret'],
  ],
  email: [
    'Resend email',
    'Send order notifications, confirmations, cart reminders, and opted-in campaigns.',
    ['apiKey', 'from'],
  ],
  sms: [
    'Twilio SMS & WhatsApp',
    'Send delivery updates when the buyer opts in and the sender supports the destination.',
    ['accountSid', 'authToken', 'from', 'whatsappFrom'],
  ],
  market: [
    'Market data feed',
    'Connect a public HTTPS endpoint that returns your authorized market observations.',
    ['endpoint', 'token'],
  ],
};
const labels = {
  storeId: 'Store ID',
  storePassword: 'Store password',
  sandbox: 'Sandbox mode',
  secretKey: 'Secret key',
  webhookSecret: 'Webhook signing secret',
  clientId: 'Client ID',
  clientSecret: 'Client secret',
  signature: 'Signature key',
  apiKey: 'API key',
  username: 'Merchant email',
  password: 'Merchant password',
  token: 'Access token',
  pixelId: 'Pixel ID',
  testCode: 'Test event code (optional)',
  measurementId: 'Measurement ID',
  endpoint: 'Endpoint URL',
  apiSecret: 'API secret',
  from: 'Sender email or phone',
  accountSid: 'Account SID',
  authToken: 'Auth token',
  whatsappFrom: 'WhatsApp sender',
  appKey: 'App key',
  appSecret: 'App secret',
  prefix: 'Merchant prefix',
};
const secrets = new Set([
  'storePassword',
  'secretKey',
  'webhookSecret',
  'clientSecret',
  'signature',
  'apiKey',
  'password',
  'token',
  'apiSecret',
  'authToken',
  'appKey',
  'appSecret',
]);
function ProviderCard({ name, provider, reload, owner }) {
  const { slug, shop } = useWorkspace();
  const [label, description, fields] = info[name];
  const action = useMutation(reload);
  const path = shopPath(slug, `/providers/${name}`);
  async function save(event) {
    event.preventDefault();
    const form = event.currentTarget,
      data = getFields(form);
    for (const field of ['sandbox', 'enabled'])
      if (field === 'enabled' || fields.includes(field)) data[field] = data[field] === 'on';
    const saved = await action.mutate(path, 'PUT', data, (result) =>
      result.configured
        ? 'Provider settings saved.'
        : 'Settings saved. Complete the required fields to enable the provider.',
    );
    if (saved) for (const input of form.querySelectorAll('input[type=password]')) input.value = '';
  }
  async function connect() {
    const result = await action.mutate(shopPath(slug, '/stripe/connect'), 'POST', {
      country: shop.country,
    });
    if (result?.url) window.location.assign(result.url);
  }
  return (
    <details className="surface provider-card">
      <summary>
        <div>
          <h3>{label}</h3>
          <p className="fine muted">{description}</p>
        </div>
        <Status
          value={
            provider?.configured
              ? 'connected'
              : provider?.enabled === false
                ? 'disabled'
                : 'setup required'
          }
        />
      </summary>
      {owner && (
        <>
          <form onSubmit={save} className="fields mt-4">
            {fields.map((field) =>
              field === 'sandbox' ? (
                <Toggle key={field} name="sandbox" defaultChecked={provider?.fields?.sandbox !== false}>
                  Use sandbox mode
                </Toggle>
              ) : (
                <Field
                  key={field}
                  label={labels[field] || field}
                  name={field}
                  type={secrets.has(field) ? 'password' : field === 'endpoint' ? 'url' : 'text'}
                  defaultValue={secrets.has(field) ? undefined : provider?.fields?.[field]}
                  autoComplete={secrets.has(field) ? 'new-password' : 'off'}
                  placeholder={secrets.has(field) ? 'Leave blank to keep saved value' : undefined}
                />
              ),
            )}
            <Toggle name="enabled" defaultChecked={provider?.enabled !== false}>
              Enable provider
            </Toggle>
            <div className="field-span row">
              <Button type="submit" disabled={action.busy}>
                Save settings
              </Button>
              <Button
                tone="danger"
                disabled={action.busy}
                onClick={() => {
                  if (window.confirm(`Disconnect ${label}?`))
                    action.mutate(path, 'DELETE', undefined, 'Provider disconnected.');
                }}
              >
                Disconnect
              </Button>
            </div>
          </form>
          {name === 'stripe' && (
            <div className="stack mt-4 muted-block">
              <p className="fine">
                Stripe Connect onboards eligible sellers and supports platform fees on connected account
                payments.
              </p>
              <div className="row">
                <Button tone="secondary" onClick={connect} disabled={action.busy}>
                  <FiExternalLink /> Open Stripe onboarding
                </Button>
                <Button
                  tone="secondary"
                  onClick={() =>
                    action.mutate(shopPath(slug, '/stripe/verify'), 'POST', {}, (result) =>
                      result.enabled
                        ? 'Stripe can accept charges.'
                        : 'Complete onboarding in Stripe first.',
                    )
                  }
                  disabled={action.busy}
                >
                  Check status
                </Button>
              </div>
              {provider?.fields?.accountId && <p className="fine mono">{provider.fields.accountId}</p>}
              <p className="fine muted">
                For your own Stripe keys, configure a webhook at the API URL followed by{' '}
                <code>/payments/stripe/webhook/{slug}</code>.
              </p>
            </div>
          )}
        </>
      )}
      <div className="mt-3">
        <Feedback action={action} />
      </div>
    </details>
  );
}
export function ProviderSettings({ section }) {
  const source = useShopResource('/settings'),
    { slug, owner } = useWorkspace();
  const groups = {
    payments: ['sslcommerz', 'bkash', 'stripe', 'paypal', 'aamarpay', 'shurjopay'],
    couriers: ['steadfast', 'pathao', 'redx', 'shippo'],
    tracking: ['meta', 'tiktok', 'google', 'email', 'sms', 'market'],
  };
  const heading = {
    payments: [
      'Payments',
      'Connect local and international providers. Cash on delivery is controlled in Store settings.',
    ],
    couriers: [
      'Shipping providers',
      'Connect couriers, then dispatch and track orders from the Orders screen.',
    ],
    tracking: [
      'Tracking and integrations',
      'Connect analytics, messaging, and research feeds for this store.',
    ],
  }[section];
  return (
    <>
      <Heading
        eyebrow="Settings"
        title={heading[0]}
        description={heading[1]}
        actions={
          section === 'couriers' ? (
            <Button tone="secondary" href={workspaceLink('/dashboard/settings', slug)}>
              Delivery zones
            </Button>
          ) : undefined
        }
      />
      <NeedShop>
        <Resource source={source}>
          {(settings) => (
            <div className="stack-lg">
              {groups[section].map((name) => (
                <ProviderCard
                  key={`${slug}:${name}:${settings.providers[name]?.enabled}`}
                  name={name}
                  provider={settings.providers[name]}
                  reload={source.reload}
                  owner={owner}
                />
              ))}
              {section === 'tracking' && owner && <Connections settings={settings} />}
              {section === 'payments' && owner && (
                <Payouts configured={settings.providers.stripe.configured} />
              )}
            </div>
          )}
        </Resource>
      </NeedShop>
    </>
  );
}
function Payouts({ configured }) {
  const source = useShopResource(configured ? '/payouts' : null);
  return (
    <section className="surface stack">
      <h2>Stripe balance and payouts</h2>
      {!configured ? (
        <p className="muted">Connect Stripe to see your balance and payouts.</p>
      ) : (
        <Resource source={source}>
          {(data) => (
            <>
              <div className="grid-2">
                {['available', 'pending'].map((key) => (
                  <div className="muted-block" key={key}>
                    <span className="label-text capitalize">{key} balance</span>
                    {data.balance?.[key]?.length ? (
                      data.balance[key].map((item) => (
                        <div key={item.currency}>
                          <strong>{money(item.amount, item.currency)}</strong>
                        </div>
                      ))
                    ) : (
                      <p>—</p>
                    )}
                  </div>
                ))}
              </div>
              <Table
                columns={['Payout', 'Amount', 'Expected arrival', 'Status']}
                rows={data.payouts || []}
                render={(item) => (
                  <>
                    <td>{item.id}</td>
                    <td>{money(item.amount, item.currency)}</td>
                    <td>{dateLabel(item.arrival)}</td>
                    <td>
                      <Status value={item.status} />
                    </td>
                  </>
                )}
              />
            </>
          )}
        </Resource>
      )}
    </section>
  );
}
function StoreForm({ settings, reload }) {
  const { slug, reloadShops } = useWorkspace();
  const [zones, setZones] = useState(settings.shipping || []),
    [rates, setRates] = useState(settings.rates || {}),
    [collections, setCollections] = useState(settings.collections || []);
  const action = useMutation(() => {
    reload();
    reloadShops();
  });
  function zoneChange(id, field, value) {
    setZones((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }
  async function save(event) {
    event.preventDefault();
    const values = getFields(event.currentTarget);
    const {
      seoTitle,
      seoDescription,
      address,
      city,
      postcode,
      region,
      shipName,
      shipPhone,
      shipCountry,
      shipEmail,
      length,
      width,
      height,
      ...rest
    } = values;
    const data = {
      ...rest,
      codEnabled: values.codEnabled === 'on',
      seo: { title: seoTitle, description: seoDescription },
      shipping: zones,
      rates: Object.fromEntries(Object.entries(rates).filter(([, value]) => Number(value) > 0)),
      collections,
    };
    if (address)
      data.shipFrom = {
        name: shipName,
        phone: shipPhone,
        address,
        city,
        postcode,
        region,
        country: shipCountry,
        email: shipEmail,
      };
    if (length && width && height) data.parcel = { length, width, height };
    await action.mutate(shopPath(slug, '/settings'), 'PATCH', data, 'Store settings saved.');
  }
  return (
    <form className="stack-lg" onSubmit={save}>
      <section className="surface stack">
        <h2>Store profile</h2>
        <div className="fields">
          <Field label="Store name" name="name" required defaultValue={settings.name} />
          <Field label="Logo URL" name="logoUrl" type="url" defaultValue={settings.logoUrl} />
          <Field
            label="Store country code"
            name="country"
            maxLength={2}
            required
            defaultValue={settings.country}
          />
          <Field label="Timezone" name="timezone" defaultValue={settings.timezone} />
          <Field label="Base currency">
            <select name="currency" defaultValue={settings.currency}>
              {currencies.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Language">
            <select name="language" defaultValue={settings.language}>
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </Field>
          <Field
            label="WhatsApp Business phone"
            name="whatsapp"
            placeholder="+880…"
            defaultValue={settings.whatsapp}
          />
          <Field label="Automatic dispatch">
            <select name="autoCourier" defaultValue={settings.autoCourier}>
              <option value="">Dispatch manually</option>
              <option value="steadfast">Steadfast</option>
              <option value="pathao">Pathao (requires area details)</option>
            </select>
          </Field>
          <div className="field-span">
            <Field label="Description">
              <textarea name="description" defaultValue={settings.description} />
            </Field>
          </div>
          <Toggle name="codEnabled" defaultChecked={settings.codEnabled}>
            Accept cash on delivery
          </Toggle>
        </div>
      </section>
      <section className="surface stack">
        <h2>Search appearance</h2>
        <Field label="SEO title" name="seoTitle" maxLength={70} defaultValue={settings.seo?.title} />
        <Field label="SEO description">
          <textarea name="seoDescription" maxLength={180} defaultValue={settings.seo?.description} />
        </Field>
      </section>
      <section className="surface stack">
        <h2>International currencies</h2>
        <p className="muted fine">
          Set units of the target currency per one {settings.currency}. Checkout calculates and records
          the total with the saved rate. A blank value disables that currency.
        </p>
        <div className="fields fields-3">
          {currencies
            .filter((value) => value !== settings.currency)
            .map((value) => (
              <Field
                key={value}
                label={value}
                type="number"
                min="0.000001"
                step="any"
                value={rates[value] ?? ''}
                onChange={(event) => setRates({ ...rates, [value]: event.target.value })}
              />
            ))}
        </div>
      </section>
      <section className="surface stack">
        <div className="section-title">
          <div>
            <h2>Delivery zones</h2>
            <p className="muted fine">
              Match a country and optional postal prefix. Rates use base price plus weight in kg.
            </p>
          </div>
          <Button
            tone="secondary"
            onClick={() =>
              setZones([
                ...zones,
                {
                  id: crypto.randomUUID(),
                  label: '',
                  country: 'BD',
                  postalPrefix: '',
                  base: 0,
                  perKg: 0,
                },
              ])
            }
            disabled={zones.length >= 40}
          >
            <FiPlus /> Add zone
          </Button>
        </div>
        {zones.map((zone) => (
          <div className="fields fields-3 muted-block" key={zone.id}>
            {[
              ['label', 'Name', 'text'],
              ['country', 'Country code or *', 'text'],
              ['postalPrefix', 'Postal prefix', 'text'],
              ['base', 'Base fee', 'number'],
              ['perKg', 'Fee per kg', 'number'],
            ].map(([field, label, type]) => (
              <Field
                key={field}
                label={label}
                value={zone[field]}
                required={field !== 'postalPrefix'}
                type={type}
                min={type === 'number' ? 0 : undefined}
                step={type === 'number' ? '.01' : undefined}
                onChange={(event) => zoneChange(zone.id, field, event.target.value)}
              />
            ))}
            <div className="self-end">
              <Button tone="quiet" onClick={() => setZones(zones.filter((item) => item.id !== zone.id))}>
                Remove zone
              </Button>
            </div>
          </div>
        ))}
      </section>
      <section className="surface stack">
        <h2>Ship-from address</h2>
        <div className="fields fields-3">
          {[
            ['shipName', 'name', 'Sender name'],
            ['shipPhone', 'phone', 'Phone'],
            ['shipEmail', 'email', 'Email'],
            ['address', 'address', 'Street address'],
            ['city', 'city', 'City'],
            ['region', 'region', 'Region'],
            ['postcode', 'postcode', 'Postal code'],
            ['shipCountry', 'country', 'Country code'],
          ].map(([name, key, label]) => (
            <Field key={name} label={label} name={name} defaultValue={settings.shipFrom?.[key]} />
          ))}
        </div>
        <div className="fields fields-3">
          {['length', 'width', 'height'].map((key) => (
            <Field
              key={key}
              label={`Parcel ${key} (cm)`}
              name={key}
              type="number"
              min="1"
              defaultValue={settings.parcel?.[key]}
            />
          ))}
        </div>
      </section>
      <section className="surface stack">
        <div className="section-title">
          <div>
            <h2>Collections</h2>
            <p className="fine muted">Group products by their tags.</p>
          </div>
          <Button
            tone="secondary"
            onClick={() =>
              setCollections([...collections, { id: crypto.randomUUID(), name: '', tags: '' }])
            }
          >
            <FiPlus /> Add collection
          </Button>
        </div>
        {collections.map((item, index) => (
          <div className="fields fields-3 muted-block" key={item.id}>
            <Field
              label="Collection name"
              value={item.name}
              onChange={(event) =>
                setCollections(
                  collections.map((value, n) =>
                    n === index ? { ...value, name: event.target.value } : value,
                  ),
                )
              }
            />
            <Field
              label="Tags, comma separated"
              value={Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
              onChange={(event) =>
                setCollections(
                  collections.map((value, n) =>
                    n === index ? { ...value, tags: event.target.value } : value,
                  ),
                )
              }
            />
            <div className="self-end">
              <Button
                tone="quiet"
                onClick={() => setCollections(collections.filter((_, n) => n !== index))}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </section>
      <Feedback action={action} />
      <div>
        <Button type="submit" disabled={action.busy}>
          {action.busy ? 'Saving…' : 'Save store settings'}
        </Button>
      </div>
    </form>
  );
}
function Domains() {
  const { slug } = useWorkspace();
  const source = useShopResource('/domains'),
    pages = useShopResource('/landings');
  const action = useMutation(source.reload),
    base = shopPath(slug, '/domains');
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (
      await action.mutate(
        base,
        'POST',
        getFields(form),
        'Domain added. Create the TXT record to verify it.',
      )
    )
      form.reset();
  }
  return (
    <section className="surface stack">
      <h2>Custom domains</h2>
      <p className="muted fine">
        Add the hostname to your Next.js hosting project and follow its DNS instructions. Verify
        ownership here to route it to your store or a published landing page.
      </p>
      <form className="fields" onSubmit={submit}>
        <Field label="Hostname" name="host" placeholder="shop.example.com" required />
        <Field label="Destination">
          <select name="pageSlug">
            <option value="">Storefront</option>
            {pages.data
              ?.filter((item) => item.status === 'published')
              .map((item) => (
                <option value={item.slug} key={item.id}>
                  {item.title}
                </option>
              ))}
          </select>
        </Field>
        <div className="field-span">
          <Button type="submit" disabled={action.busy}>
            <FiGlobe /> Add domain
          </Button>
        </div>
      </form>
      <Feedback action={action} />
      <Resource source={source}>
        {(items) =>
          items.map((item) => (
            <div key={item.id} className="muted-block stack">
              <div className="row between">
                <strong>{item.host}</strong>
                <Status value={item.verified ? 'verified' : 'pending'} />
              </div>
              {!item.verified && (
                <p className="fine break">
                  TXT record <code>_shopos.{item.host}</code> → <code>{item.token}</code>
                </p>
              )}
              <div className="row">
                <Button
                  tone="secondary"
                  disabled={action.busy}
                  onClick={() =>
                    action.mutate(`${base}/${item.id}/verify`, 'POST', {}, 'Domain ownership verified.')
                  }
                >
                  Verify DNS
                </Button>
                <Button
                  tone="danger"
                  disabled={action.busy}
                  onClick={() => {
                    if (window.confirm(`Remove ${item.host}?`))
                      action.mutate(`${base}/${item.id}`, 'DELETE', undefined, 'Domain removed.');
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        }
      </Resource>
    </section>
  );
}
export function StoreSettings() {
  const source = useShopResource('/settings'),
    { slug, owner, canManage } = useWorkspace();
  return (
    <>
      <Heading
        eyebrow="Settings"
        title="Store settings"
        description="Manage your store identity, markets, delivery rates, and domains."
        actions={
          <Button tone="secondary" href={workspaceLink('/dashboard/settings/integrations', slug)}>
            Integrations <FiExternalLink />
          </Button>
        }
      />
      <NeedShop>
        <Resource source={source}>
          {(settings) =>
            owner ? (
              <div className="stack-lg">
                <StoreForm key={slug} settings={settings} reload={source.reload} />
                {settings.rootDomain && (
                  <Notice>
                    Your store is available at {slug}.{settings.rootDomain} once wildcard hosting and DNS
                    are configured.
                  </Notice>
                )}
                <Domains />
                <StoreContent key={`content:${slug}`} settings={settings} reload={source.reload} />
              </div>
            ) : canManage ? (
              <StoreContent key={`content:${slug}`} settings={settings} reload={source.reload} />
            ) : (
              <Notice tone="warn">Ask the store owner to update these settings.</Notice>
            )
          }
        </Resource>
      </NeedShop>
    </>
  );
}
function Connections() {
  const { slug } = useWorkspace();
  const hooks = useShopResource('/webhooks'),
    jobs = useShopResource('/jobs');
  const action = useMutation(hooks.reload),
    retry = useMutation(jobs.reload);
  const [secret, setSecret] = useState(null);
  async function add(event) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form);
    const result = await action.mutate(
      shopPath(slug, '/webhooks'),
      'POST',
      { url: data.get('url'), events: data.getAll('event') },
      'Webhook created.',
    );
    if (result) {
      setSecret(result.secret);
      form.reset();
    }
  }
  return (
    <>
      <section className="surface stack">
        <h2>Outgoing webhooks</h2>
        <p className="muted fine">
          Send signed events to a public HTTPS receiver such as a Zapier or Make webhook.
        </p>
        <form className="stack" onSubmit={add}>
          <Field label="Destination URL" name="url" type="url" required />
          <div className="row">
            {['order.created', 'order.updated', 'product.updated'].map((value) => (
              <Toggle key={value} name="event" value={value}>
                {value}
              </Toggle>
            ))}
          </div>
          <div>
            <Button type="submit" disabled={action.busy}>
              Create webhook
            </Button>
          </div>
        </form>
        <Feedback action={action} />
        {secret && (
          <div className="muted-block break">
            <strong>Copy the signing secret now</strong>
            <p>
              <code>{secret}</code>
            </p>
          </div>
        )}
        <Resource source={hooks}>
          {(items) =>
            items.map((item) => (
              <div key={item.id} className="detail-row">
                <span className="break">
                  {item.url}
                  <small className="block">{item.events.join(', ')}</small>
                </span>
                <IconButton
                  icon={FiTrash2}
                  label="Delete webhook"
                  onClick={() =>
                    action.mutate(
                      shopPath(slug, `/webhooks/${item.id}`),
                      'DELETE',
                      undefined,
                      'Webhook removed.',
                    )
                  }
                />
              </div>
            ))
          }
        </Resource>
        <a className="external" href={`/api/shopos${shopPath(slug, '/feed.xml')}`}>
          Open Google Merchant Center XML feed <FiExternalLink />
        </a>
      </section>
      <section className="surface stack">
        <div className="section-title">
          <h2>Background deliveries</h2>
          <Button tone="secondary" onClick={jobs.reload}>
            Refresh
          </Button>
        </div>
        <Resource source={jobs}>
          {(items) => (
            <Table
              columns={['Type', 'State', 'Attempts', 'Action']}
              rows={items}
              empty="No pending or failed deliveries"
              render={(item) => (
                <>
                  <td>{item.type}</td>
                  <td>
                    <Status value={item.state} />
                    {item.lastError && <small className="block">{item.lastError}</small>}
                  </td>
                  <td>{item.attempts}</td>
                  <td>
                    {item.state === 'failed' && (
                      <Button
                        tone="secondary"
                        disabled={retry.busy}
                        onClick={() =>
                          retry.mutate(
                            shopPath(slug, `/jobs/${item.id}/retry`),
                            'POST',
                            {},
                            'Retry queued.',
                          )
                        }
                      >
                        Retry
                      </Button>
                    )}
                  </td>
                </>
              )}
            />
          )}
        </Resource>
        <Feedback action={retry} />
      </section>
    </>
  );
}
function Team() {
  const { slug } = useWorkspace();
  const source = useShopResource('/staff'),
    action = useMutation(source.reload),
    path = shopPath(slug, '/staff');
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (
      await action.mutate(
        path,
        'POST',
        getFields(form),
        'Team access saved. The member can sign in with this verified email.',
      )
    )
      form.reset();
  }
  return (
    <section className="surface stack">
      <h2>Team access</h2>
      <p className="muted fine">
        Managers can edit the catalog and campaigns. Support staff can work with orders and support
        tickets. Both need a verified email.
      </p>
      <form className="fields" onSubmit={submit}>
        <Field label="Team member email" type="email" name="email" required />
        <Field label="Role">
          <select name="role">
            <option value="manager">Manager</option>
            <option value="support">Support</option>
          </select>
        </Field>
        <div className="field-span">
          <Button type="submit" disabled={action.busy}>
            <FiUsers /> Add team member
          </Button>
        </div>
      </form>
      <Feedback action={action} />
      <Resource source={source}>
        {(items) => (
          <Table
            columns={['Email', 'Role', 'Status', 'Action']}
            rows={items}
            render={(item) => (
              <>
                <td>{item.email}</td>
                <td>{item.role}</td>
                <td>
                  <Status value={item.active ? 'active' : 'revoked'} />
                </td>
                <td>
                  {item.active && (
                    <Button
                      tone="danger"
                      disabled={action.busy}
                      onClick={() =>
                        action.mutate(`${path}/${item.id}`, 'DELETE', undefined, 'Access revoked.')
                      }
                    >
                      Revoke
                    </Button>
                  )}
                </td>
              </>
            )}
          />
        )}
      </Resource>
    </section>
  );
}
function BillingPanel({ data, reload }) {
  const { slug } = useWorkspace();
  const search = useSearchParams();
  const [cadence, setCadence] = useState('monthly'),
    [verify, setVerify] = useState(null);
  const action = useMutation();
  const path = shopPath(slug, '/billing');
  const checkout = search.get('checkout');
  useEffect(() => {
    if (!checkout || !slug) return undefined;
    let current = true;
    request(`${path}/verify`, { method: 'POST', data: { checkoutId: checkout } })
      .then((value) => {
        if (current)
          setVerify(
            value.paid
              ? 'Payment confirmed. Refresh to view the updated plan.'
              : 'Billing payment is awaiting confirmation.',
          );
      })
      .catch((error) => {
        if (current) setVerify(error.message);
      });
    return () => {
      current = false;
    };
  }, [checkout, path, slug]);
  async function open(method, payload) {
    const result = await action.mutate(`${path}/${method}`, 'POST', payload);
    if (result?.url) window.location.assign(result.url);
  }
  return (
    <>
      <section className="surface stack">
        <div className="section-title">
          <div>
            <h2>{data.plans[data.plan]?.name || data.plan} plan</h2>
            <p className="muted fine">
              {data.billing.status
                ? `Billing status: ${data.billing.status}`
                : data.trialEndsAt
                  ? `Trial ends ${dateLabel(data.trialEndsAt)}`
                  : 'Free plan'}
            </p>
          </div>
          {data.billing.hasCustomer && (
            <Button tone="secondary" disabled={action.busy} onClick={() => open('portal', {})}>
              <FiCreditCard /> Billing portal
            </Button>
          )}
        </div>
        {verify && (
          <div className="row">
            <Notice>{verify}</Notice>
            <Button tone="secondary" onClick={reload}>
              Refresh plan
            </Button>
          </div>
        )}
        <div className="grid-4">
          {Object.entries(data.usage).map(([key, value]) => (
            <div key={key} className="muted-block">
              <span className="label-text capitalize">
                {key === 'bandwidth' ? 'Monthly storefront data' : key}
              </span>
              <p>
                <strong>{key === 'bandwidth' ? `${(value / 1e6).toFixed(1)} MB` : value}</strong> /{' '}
                {key === 'bandwidth'
                  ? `${(data.plans[data.plan].bandwidth / 1e6).toFixed(0)} MB`
                  : data.plans[data.plan][key]}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="surface stack">
        <div className="section-title">
          <h2>Plans</h2>
          <div className="pill-tabs">
            {[
              ['monthly', 'Monthly'],
              ['yearly', 'Yearly'],
              ['lifetime', 'One time'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={cadence === key}
                onClick={() => setCadence(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {!data.available && (
          <Notice tone="warn">Platform billing needs Stripe keys on the server.</Notice>
        )}
        <div className="grid-3">
          {Object.entries(data.plans)
            .filter(([key]) => key !== 'free')
            .map(([key, plan]) => (
              <div key={key} className="muted-block stack">
                <h3>{plan.name}</h3>
                <p className="plan-price">{money(plan[cadence], data.currency)}</p>
                <p className="fine">
                  {plan.products} products · {plan.pages} pages · {plan.seats} seats
                </p>
                <Button
                  tone={data.plan === key ? 'secondary' : 'primary'}
                  disabled={!data.available || action.busy || data.billing.status === 'lifetime'}
                  onClick={() => open('checkout', { plan: key, cadence })}
                >
                  Choose {plan.name}
                </Button>
              </div>
            ))}
        </div>
        <Feedback action={action} />
      </section>
      <section className="surface stack">
        <h2>Invoices</h2>
        <Table
          columns={['Date', 'Amount', 'Status', 'Receipt']}
          rows={data.invoices}
          render={(item) => (
            <>
              <td>{dateLabel(item.createdAt)}</td>
              <td>{money(item.amount, item.currency)}</td>
              <td>
                <Status value={item.status} />
              </td>
              <td>{item.url ? <External href={item.url}>Open</External> : '—'}</td>
            </>
          )}
        />
      </section>
    </>
  );
}
export function Billing() {
  const { owner } = useWorkspace();
  const source = useShopResource(owner ? '/billing' : null);
  return (
    <>
      <Heading
        eyebrow="Settings"
        title="Team & billing"
        description="Manage store access, subscriptions, and invoices."
      />
      <NeedShop>
        {owner ? (
          <div className="stack-lg">
            <Resource source={source}>
              {(data) => <BillingPanel data={data} reload={source.reload} />}
            </Resource>
            <Team />
          </div>
        ) : (
          <Notice tone="warn">Team and billing settings are available to the store owner.</Notice>
        )}
      </NeedShop>
    </>
  );
}
