'use client';

import { useState } from 'react';
import {
  FiCopy,
  FiExternalLink,
  FiGlobe,
  FiPlus,
  FiSend,
  FiTrash2,
  FiTrendingUp,
  FiUpload,
} from 'react-icons/fi';
import {
  Button,
  Empty,
  External,
  Field,
  Heading,
  IconButton,
  Notice,
  Rise,
  Status,
  Table,
  Toggle,
} from './ui';
import { Feedback, NeedShop, Resource, useMutation, useShopResource, useWorkspace } from './workspace';
import { currencies, dateLabel, getFields, money, shopPath } from '@/lib/shopos';

function AddDiscount({ reload }) {
  const { slug, shop } = useWorkspace();
  const [type, setType] = useState('percent');
  const products = useShopResource('/products?all=1&limit=300');
  const action = useMutation(reload);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget,
      raw = new FormData(form);
    const data = Object.fromEntries(raw);
    data.productIds = raw.getAll('productIds');
    data.automatic = raw.get('automatic') === 'on';
    for (const key of ['startsAt', 'endsAt'])
      if (data[key]) data[key] = new Date(data[key]).toISOString();
    if (await action.mutate(shopPath(slug, '/discounts'), 'POST', data, 'Campaign created.'))
      form.reset();
  }
  return (
    <section className="surface stack">
      <h2>Create a discount or campaign</h2>
      <form className="fields fields-3" onSubmit={submit}>
        <Field label="Code" name="code" required minLength={3} maxLength={32} />
        <Field label="Type">
          <select name="type" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="percent">Percentage</option>
            <option value="fixed">Fixed amount</option>
            <option value="flash">Flash sale</option>
            <option value="bundle">Product bundle</option>
          </select>
        </Field>
        <Field
          label={type === 'fixed' ? `Amount (${shop.currency})` : 'Percent off'}
          type="number"
          name="value"
          min=".01"
          max={type === 'fixed' ? undefined : 100}
          step=".01"
          required
        />
        <Field label="Starts at (optional)" type="datetime-local" name="startsAt" />
        <Field label="Ends at (optional)" type="datetime-local" name="endsAt" />
        <Field
          label="Maximum redemptions"
          type="number"
          name="maxUses"
          min="0"
          placeholder="0 for unlimited"
        />
        <Field label="Minimum subtotal" type="number" name="minSubtotal" min="0" step=".01" />
        {type === 'bundle' && (
          <Field
            label="Minimum bundle quantity"
            type="number"
            name="minQuantity"
            min="1"
            defaultValue="2"
          />
        )}
        <Field label="Products (optional)" hint="Leave empty to apply to the catalog.">
          <select name="productIds" multiple size={3}>
            {products.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        {['flash', 'bundle'].includes(type) && (
          <Toggle name="automatic" defaultChecked>
            Apply automatically at checkout
          </Toggle>
        )}
        <div className="field-span">
          <Button type="submit" disabled={action.busy}>
            <FiPlus /> Create campaign
          </Button>
        </div>
      </form>
      <Feedback action={action} />
    </section>
  );
}
export function Marketing() {
  const { slug, canManage } = useWorkspace();
  const source = useShopResource('/discounts'),
    reviews = useShopResource(canManage ? '/reviews' : null);
  const action = useMutation(source.reload),
    reviewAction = useMutation(reviews.reload),
    campaign = useMutation();
  async function mail(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (
      await campaign.mutate(
        shopPath(slug, '/campaigns/email'),
        'POST',
        getFields(form),
        (result) => `Queued ${result.queued} opted-in emails.`,
      )
    )
      form.reset();
  }
  return (
    <>
      <Heading
        eyebrow="Growth"
        title="Marketing"
        description="Run discounts, review customer feedback, and email subscribed shoppers."
      />
      <NeedShop>
        <div className="stack-lg">
          {canManage && <AddDiscount reload={source.reload} />}
          <section className="surface stack">
            <h2>Discounts and campaigns</h2>
            <Resource source={source}>
              {(items) => (
                <Table
                  columns={['Code', 'Type', 'Value', 'Uses', 'Status', 'Action']}
                  rows={items}
                  render={(item) => (
                    <>
                      <td>
                        <strong>{item.code}</strong>
                        <small className="block">{item.automatic ? 'Automatic' : 'At checkout'}</small>
                      </td>
                      <td>{item.type}</td>
                      <td>
                        {item.value}
                        {item.type !== 'fixed' ? '%' : ''}
                      </td>
                      <td>
                        {item.uses} / {item.maxUses || '∞'}
                      </td>
                      <td>
                        <Status value={item.active ? 'active' : 'paused'} />
                      </td>
                      <td>
                        {canManage && (
                          <Button
                            tone="secondary"
                            disabled={action.busy}
                            onClick={() =>
                              action.mutate(
                                shopPath(slug, `/discounts/${item.id}`),
                                'PATCH',
                                { active: !item.active },
                                'Campaign updated.',
                              )
                            }
                          >
                            {item.active ? 'Pause' : 'Activate'}
                          </Button>
                        )}
                      </td>
                    </>
                  )}
                />
              )}
            </Resource>
            <Feedback action={action} />
          </section>
          {canManage && (
            <div className="grid-2">
              <section className="surface stack">
                <h2>Email campaign</h2>
                <p className="muted fine">
                  Only confirmed subscribers receive a message. Set up email delivery under Integrations.
                </p>
                <form className="stack" onSubmit={mail}>
                  <Field label="Subject" name="subject" required />
                  <Field label="Message">
                    <textarea name="body" required maxLength={1800} />
                  </Field>
                  <div>
                    <Button type="submit" disabled={campaign.busy}>
                      <FiSend /> Queue campaign
                    </Button>
                  </div>
                </form>
                <Feedback action={campaign} />
              </section>
              <section className="surface stack">
                <h2>Customer reviews</h2>
                <Resource source={reviews}>
                  {(items) =>
                    items.length ? (
                      items.map((item) => (
                        <div key={item.id} className="muted-block stack">
                          <div className="row between">
                            <strong>
                              {item.name} · {item.rating}/5
                            </strong>
                            <Status value={item.status} />
                          </div>
                          <p>{item.text}</p>
                          <div className="row">
                            <Button
                              tone="secondary"
                              onClick={() =>
                                reviewAction.mutate(
                                  shopPath(slug, `/reviews/${item.id}`),
                                  'PATCH',
                                  { status: 'published' },
                                  'Review published.',
                                )
                              }
                              disabled={reviewAction.busy}
                            >
                              Publish
                            </Button>
                            <Button
                              tone="quiet"
                              onClick={() =>
                                reviewAction.mutate(
                                  shopPath(slug, `/reviews/${item.id}`),
                                  'PATCH',
                                  { status: 'hidden' },
                                  'Review hidden.',
                                )
                              }
                              disabled={reviewAction.busy}
                            >
                              Hide
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Empty title="No reviews to moderate" />
                    )
                  }
                </Resource>
                <Feedback action={reviewAction} />
              </section>
            </div>
          )}
        </div>
      </NeedShop>
    </>
  );
}
export function Affiliates() {
  const { slug, canManage } = useWorkspace();
  const source = useShopResource(canManage ? '/affiliates' : null),
    action = useMutation(source.reload);
  const [copied, setCopied] = useState('');
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await action.mutate(shopPath(slug, '/affiliates'), 'POST', getFields(form), 'Affiliate added.'))
      form.reset();
  }
  async function copy(code) {
    const url = `${location.origin}${shopPath(slug)}?ref=${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(`Copied ${url}`);
    } catch {
      setCopied(url);
    }
  }
  return (
    <>
      <Heading
        eyebrow="Growth"
        title="Affiliates"
        description="Create referral links and track commissions on verified sales."
      />
      <NeedShop>
        {canManage ? (
          <div className="stack-lg">
            <section className="surface stack">
              <h2>Add a partner</h2>
              <form className="fields" onSubmit={submit}>
                <Field label="Partner name" name="name" required />
                <Field label="Partner email" name="email" type="email" required />
                <Field label="Referral code" name="code" placeholder="Auto-generated from name" />
                <Field
                  label="Commission (%)"
                  name="percent"
                  min="0"
                  max="80"
                  step=".1"
                  type="number"
                  defaultValue="10"
                  required
                />
                <div className="field-span">
                  <Button type="submit" disabled={action.busy}>
                    <FiPlus /> Add affiliate
                  </Button>
                </div>
              </form>
              <Feedback action={action} />
              <Notice>{copied}</Notice>
            </section>
            <section className="surface stack">
              <h2>Partners</h2>
              <Resource source={source}>
                {(items) => (
                  <Table
                    columns={['Partner', 'Code', 'Status', 'Paid orders / commission', 'Actions']}
                    rows={items}
                    render={(item) => (
                      <>
                        <td>
                          <strong>{item.name}</strong>
                          <small className="block">{item.email}</small>
                        </td>
                        <td>
                          <code>{item.code}</code>
                        </td>
                        <td>
                          <Status value={item.status} />
                        </td>
                        <td>
                          {item.results.length
                            ? item.results.map((result) => (
                                <div key={result.currency}>
                                  {result.orders} · {money(result.commission, result.currency)}
                                </div>
                              ))
                            : '—'}
                        </td>
                        <td>
                          <div className="row flex-nowrap">
                            <IconButton
                              icon={FiCopy}
                              label={`Copy ${item.name} referral link`}
                              onClick={() => copy(item.code)}
                            />
                            <Button
                              tone="secondary"
                              onClick={() =>
                                action.mutate(
                                  shopPath(slug, `/affiliates/${item.id}`),
                                  'PATCH',
                                  { status: item.status === 'active' ? 'paused' : 'active' },
                                  'Affiliate updated.',
                                )
                              }
                              disabled={action.busy}
                            >
                              {item.status === 'active' ? 'Pause' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  />
                )}
              </Resource>
              <p className="fine muted">
                Commissions are tracked by currency. Reconcile partner payouts separately.
              </p>
            </section>
          </div>
        ) : (
          <Notice tone="warn">Affiliate management requires a manager or store owner.</Notice>
        )}
      </NeedShop>
    </>
  );
}
const observationFields = [
  ['product', 'Product', 'text'],
  ['category', 'Category', 'text'],
  ['source', 'Source name', 'text'],
  ['sourceUrl', 'Source URL', 'url'],
  ['capturedAt', 'Observation date', 'date'],
  ['searchInterest', 'Search interest (0–100)', 'number'],
  ['adVolume', 'Ad count', 'number'],
  ['competitors', 'Competitor count', 'number'],
  ['averagePrice', 'Average market price', 'number'],
  ['unitCost', 'Estimated unit cost', 'number'],
];
function ResearchInputs({ reload }) {
  const { slug, shop } = useWorkspace();
  const action = useMutation(reload);
  const [csv, setCsv] = useState(null);
  async function save(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await action.mutate(shopPath(slug, '/research'), 'POST', getFields(form), 'Observation saved.'))
      form.reset();
  }
  async function upload() {
    const form = new FormData();
    form.set('file', csv);
    if (
      await action.mutate(
        shopPath(slug, '/research/import'),
        'POST',
        form,
        (value) => `Imported ${value.imported} observations.`,
      )
    )
      setCsv(null);
  }
  return (
    <section className="surface stack">
      <div className="section-title">
        <div>
          <h2>Add market data</h2>
          <p className="muted fine">
            Record dated figures from sources you can use, upload a CSV, or connect a data feed.
          </p>
        </div>
        <Button
          tone="secondary"
          disabled={action.busy}
          onClick={() =>
            action.mutate(
              shopPath(slug, '/research/sync'),
              'POST',
              {},
              (value) => `Synced ${value.imported} observations.`,
            )
          }
        >
          <FiGlobe /> Sync feed
        </Button>
      </div>
      <details>
        <summary className="cursor-pointer font-bold">Enter an observation</summary>
        <form className="fields fields-3 mt-4" onSubmit={save}>
          {observationFields.map(([key, label, type]) => (
            <Field
              key={key}
              label={label}
              name={key}
              type={type}
              required={!['sourceUrl', 'capturedAt', 'unitCost'].includes(key)}
              min={type === 'number' ? 0 : undefined}
              max={key === 'searchInterest' ? 100 : undefined}
              step={['averagePrice', 'unitCost'].includes(key) ? '.01' : undefined}
            />
          ))}
          <Field label="Currency">
            <select name="currency" defaultValue={shop.currency}>
              {currencies.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <div className="field-span">
            <Button type="submit" disabled={action.busy}>
              Save observation
            </Button>
          </div>
        </form>
      </details>
      <details>
        <summary className="cursor-pointer font-bold">Import observations</summary>
        <div className="stack mt-3">
          <p className="fine muted break">
            <code>
              product,category,source,sourceUrl,capturedAt,searchInterest,adVolume,competitors,averagePrice,unitCost,currency
            </code>
          </p>
          <Field
            label="Observations CSV"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setCsv(event.target.files[0])}
          />
          <div>
            <Button tone="secondary" disabled={!csv || action.busy} onClick={upload}>
              <FiUpload /> Import CSV
            </Button>
          </div>
        </div>
      </details>
      <Feedback action={action} />
    </section>
  );
}
function Sourcing({ data, reload }) {
  const { slug } = useWorkspace();
  const action = useMutation(reload);
  async function submit(event, resource) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await action.mutate(shopPath(slug, resource), 'POST', getFields(form), 'Saved.')) form.reset();
  }
  return (
    <div className="grid-2">
      <section className="surface stack">
        <h2>Supplier directory</h2>
        <div className="row">
          <External href="https://www.alibaba.com/">Alibaba</External>
          <External href="https://www.1688.com/">1688</External>
        </div>
        {data.suppliers.map((item) => (
          <div key={item.id} className="muted-block">
            <div className="row between">
              <strong>{item.name}</strong>
              <IconButton
                label={`Remove ${item.name}`}
                icon={FiTrash2}
                onClick={() =>
                  action.mutate(
                    shopPath(slug, `/suppliers/${item.id}`),
                    'DELETE',
                    undefined,
                    'Supplier removed.',
                  )
                }
              />
            </div>
            <p className="fine muted">{[item.category, item.location].filter(Boolean).join(' · ')}</p>
            {item.notes && <p>{item.notes}</p>}
            {item.url && <External href={item.url}>Supplier website</External>}
          </div>
        ))}
        <details>
          <summary className="cursor-pointer font-bold">Add a supplier</summary>
          <form className="fields mt-3" onSubmit={(event) => submit(event, '/suppliers')}>
            <Field label="Name" name="name" required />
            <Field label="Location" name="location" />
            <Field label="Category" name="category" />
            <Field label="Website" name="url" type="url" />
            <Field label="Notes">
              <textarea name="notes" />
            </Field>
            <div className="self-end">
              <Button type="submit" disabled={action.busy}>
                Add supplier
              </Button>
            </div>
          </form>
        </details>
        <Feedback action={action} />
      </section>
      <section className="surface stack">
        <h2>Seasonal calendar</h2>
        {data.calendar.map((item) => (
          <div className="muted-block" key={item.id}>
            <div className="row between">
              <strong>{item.name}</strong>
              {item.startsAt && (
                <IconButton
                  icon={FiTrash2}
                  label={`Remove ${item.name}`}
                  onClick={() =>
                    action.mutate(
                      shopPath(slug, `/seasons/${item.id}`),
                      'DELETE',
                      undefined,
                      'Calendar event removed.',
                    )
                  }
                />
              )}
            </div>
            <p className="label-text">
              {item.timing || `${dateLabel(item.startsAt)} – ${dateLabel(item.endsAt)}`}
            </p>
            <p className="fine muted mt-1">{item.action}</p>
          </div>
        ))}
        <details>
          <summary className="cursor-pointer font-bold">Add your campaign dates</summary>
          <form className="fields mt-3" onSubmit={(event) => submit(event, '/seasons')}>
            <Field label="Event" name="name" required />
            <Field label="Start date" name="startsAt" type="date" required />
            <Field label="End date" name="endsAt" type="date" required />
            <Field label="Notes" name="action" />
            <div className="field-span">
              <Button type="submit" disabled={action.busy}>
                Add event
              </Button>
            </div>
          </form>
        </details>
      </section>
    </div>
  );
}
export function Research() {
  const { canManage } = useWorkspace();
  const source = useShopResource(canManage ? '/research' : null);
  const [category, setCategory] = useState('');
  return (
    <>
      <Heading
        eyebrow="Growth"
        title="Product research"
        description="Compare demand, competition, and pricing before you source new stock."
      />
      <NeedShop>
        {canManage ? (
          <div className="stack-lg">
            <ResearchInputs reload={source.reload} />
            <Resource source={source}>
              {(data) => (
                <>
                  <section className="surface stack">
                    <div className="section-title">
                      <div>
                        <h2>Demand signals</h2>
                        <p className="muted fine">
                          {data.observations} observations · {data.sources.length} sources
                        </p>
                      </div>
                      <Field label="Category">
                        <select value={category} onChange={(event) => setCategory(event.target.value)}>
                          <option value="">All categories</option>
                          {[...new Set(data.feed.map((item) => item.category))].map((value) => (
                            <option key={value}>{value}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    {data.feed.length ? (
                      <Table
                        columns={[
                          'Product',
                          'Demand score',
                          'Competition',
                          'Market / your price',
                          'Source',
                        ]}
                        rows={data.feed.filter((item) => !category || item.category === category)}
                        render={(item) => (
                          <>
                            <td>
                              <strong>{item.product}</strong>
                              <small className="block">{item.category}</small>
                            </td>
                            <td>
                              <strong>{item.score}/100</strong>
                            </td>
                            <td>
                              {item.competitors} competitors
                              {item.oversaturated && (
                                <small className="block text-red-800">Saturation alert</small>
                              )}
                              {item.margin !== null && (
                                <small className="block">Est. margin {item.margin.toFixed(0)}%</small>
                              )}
                            </td>
                            <td>
                              {money(item.averagePrice, item.currency)} /{' '}
                              {item.sellerPrice === null ? '—' : money(item.sellerPrice, item.currency)}
                              {item.previousPrice !== null && (
                                <small className="block">
                                  Previous {money(item.previousPrice, item.currency)}
                                </small>
                              )}
                            </td>
                            <td>
                              {item.sourceUrl ? (
                                <External href={item.sourceUrl}>{item.source}</External>
                              ) : (
                                item.source
                              )}
                              <small className="block">{dateLabel(item.capturedAt)}</small>
                            </td>
                          </>
                        )}
                      />
                    ) : (
                      <Empty
                        icon={FiTrendingUp}
                        title="No market observations yet"
                        description="Import or record your first observation to see the demand feed and price comparison."
                      />
                    )}
                    <details>
                      <summary className="font-bold cursor-pointer">How scoring works</summary>
                      <p className="fine muted mt-2">
                        The score weighs search interest most heavily, adds a capped ad-volume signal,
                        and adjusts for competition. The saturation flag combines competition with weak
                        demand, low estimated margin, or falling margin. Treat it as a comparison between
                        the observations you supply.
                      </p>
                    </details>
                  </section>
                  <Sourcing data={data} reload={source.reload} />
                </>
              )}
            </Resource>
          </div>
        ) : (
          <Notice tone="warn">Market research requires a manager or store owner.</Notice>
        )}
      </NeedShop>
    </>
  );
}
