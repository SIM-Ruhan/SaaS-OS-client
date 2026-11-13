'use client';

import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Brand, Button, Field, Heading, Status, Table } from './ui';
import { Feedback, Resource, useMutation, useResource } from './workspace';
import { AdminTickets } from './support';
import { dateLabel, getFields, money } from '@/lib/shopos';

function Shops() {
  const [offset, setOffset] = useState(0);
  const source = useResource(`/admin/shops?skip=${offset}&limit=30`),
    action = useMutation(source.reload);
  async function save(event, shop) {
    event.preventDefault();
    const data = getFields(event.currentTarget);
    if (!data.plan) delete data.plan;
    if (!data.commissionPercent) delete data.commissionPercent;
    await action.mutate(`/admin/shops/${shop.slug}`, 'PATCH', data, 'Store updated.');
  }
  return (
    <section className="surface stack">
      <h2>Seller approvals and plans</h2>
      <Feedback action={action} />
      <Resource source={source}>
        {(items) => (
          <>
            {items.map((item) => (
              <form
                className="fields fields-3 muted-block"
                key={`${item.id}:${item.status}:${item.plan}`}
                onSubmit={(event) => save(event, item)}
              >
                <div className="field-span row between">
                  <div>
                    <strong>{item.name}</strong>
                    <p className="fine muted">
                      {item.slug} · {item.ownerEmail || 'No owner email saved'}
                    </p>
                  </div>
                  <Status value={item.status} />
                </div>
                <Field label="Status">
                  <select name="status" defaultValue={item.status}>
                    {['active', 'pending', 'suspended'].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>
                <Field label={`Plan (${item.plan})`}>
                  <select name="plan">
                    <option value="">Keep current</option>
                    {['free', 'starter', 'growth', 'scale'].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Commission override (%)"
                  name="commissionPercent"
                  type="number"
                  step=".1"
                  min="0"
                  max="100"
                />
                <div className="field-span">
                  <Button type="submit" disabled={action.busy}>
                    Update store
                  </Button>
                </div>
              </form>
            ))}
            {!items.length && <p className="muted">No stores in this view.</p>}
            <div className="row">
              <Button tone="secondary" disabled={!offset} onClick={() => setOffset(offset - 30)}>
                Previous
              </Button>
              <Button
                tone="secondary"
                disabled={items.length < 30}
                onClick={() => setOffset(offset + 30)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </Resource>
    </section>
  );
}
function Plans() {
  const source = useResource('/admin/plans'),
    action = useMutation(source.reload);
  async function save(event, key) {
    event.preventDefault();
    await action.mutate(
      `/admin/plans/${key}`,
      'PUT',
      getFields(event.currentTarget),
      'Plan settings saved.',
    );
  }
  return (
    <section className="surface stack">
      <h2>Plan limits, prices and fees</h2>
      <Resource source={source}>
        {(plans) =>
          Object.entries(plans).map(([key, item]) => (
            <form
              className="fields fields-3 muted-block"
              key={key}
              onSubmit={(event) => save(event, key)}
            >
              <h3 className="field-span">{item.name}</h3>
              {[
                'products',
                'pages',
                'seats',
                'bandwidth',
                'monthly',
                'yearly',
                'lifetime',
                'commissionPercent',
              ].map((field) => (
                <Field
                  key={field}
                  label={
                    field === 'commissionPercent'
                      ? 'Commission (%)'
                      : field === 'bandwidth'
                        ? 'Hosted transfer (bytes)'
                        : field
                  }
                  name={field}
                  type="number"
                  min="0"
                  step={
                    ['monthly', 'yearly', 'lifetime', 'commissionPercent'].includes(field) ? '.01' : '1'
                  }
                  defaultValue={item[field] ?? 0}
                  required
                />
              ))}
              <div className="field-span">
                <Button type="submit" disabled={action.busy}>
                  Save {item.name}
                </Button>
              </div>
            </form>
          ))
        }
      </Resource>
      <Feedback action={action} />
    </section>
  );
}
function Moderation() {
  const [draft, setDraft] = useState(''),
    [shop, setShop] = useState('');
  const source = useResource(
      `/admin/products?limit=100${shop ? `&shop=${encodeURIComponent(shop)}` : ''}`,
    ),
    action = useMutation(source.reload);
  return (
    <section className="surface stack">
      <h2>Listing moderation</h2>
      <form
        className="row"
        onSubmit={(event) => {
          event.preventDefault();
          setShop(draft.trim());
        }}
      >
        <Field
          label="Filter by shop slug"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button tone="secondary" type="submit" className="self-end">
          Filter
        </Button>
      </form>
      <Resource source={source}>
        {(items) => (
          <Table
            columns={['Product', 'Shop', 'Visibility', 'Action']}
            rows={items}
            render={(item) => (
              <>
                <td>
                  <strong>{item.name}</strong>
                </td>
                <td>{item.shopSlug}</td>
                <td>
                  <Status
                    value={
                      item.moderation === 'hidden'
                        ? 'hidden'
                        : item.active === false
                          ? 'draft'
                          : 'active'
                    }
                  />
                </td>
                <td>
                  <Button
                    tone={item.moderation === 'hidden' ? 'secondary' : 'danger'}
                    disabled={action.busy}
                    onClick={() =>
                      action.mutate(
                        `/admin/products/${item.id}`,
                        'PATCH',
                        { status: item.moderation === 'hidden' ? 'visible' : 'hidden' },
                        'Listing moderation saved.',
                      )
                    }
                  >
                    {item.moderation === 'hidden' ? 'Restore' : 'Hide'}
                  </Button>
                </td>
              </>
            )}
          />
        )}
      </Resource>
      <Feedback action={action} />
    </section>
  );
}
function Audit() {
  const source = useResource('/admin/audit');
  return (
    <section className="surface stack">
      <h2>Audit log</h2>
      <Resource source={source}>
        {(items) => (
          <Table
            columns={['Date', 'Shop', 'Action', 'Actor', 'Target']}
            rows={items}
            render={(item) => (
              <>
                <td>{dateLabel(item.createdAt)}</td>
                <td>{item.shopSlug}</td>
                <td>{item.action}</td>
                <td>{item.userId}</td>
                <td>{item.target}</td>
              </>
            )}
          />
        )}
      </Resource>
    </section>
  );
}
function Overview() {
  const source = useResource('/admin/overview');
  return (
    <Resource source={source}>
      {(data) => (
        <div className="stack-lg">
          <div className="grid-4">
            {[
              ['Active stores', data.shops.active || 0],
              ['Awaiting approval', data.shops.pending || 0],
              ['Open tickets', data.openTickets],
              ['Subscriptions cancelled in 30 days', data.churn30],
            ].map(([label, value]) => (
              <section className="surface metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </section>
            ))}
          </div>
          <section className="surface stack">
            <h2>Gross merchandise value</h2>
            <Table
              columns={['Currency', 'Paid orders', 'Total']}
              rows={data.gmv.map((row) => ({ ...row, id: row.currency }))}
              render={(row) => (
                <>
                  <td>{row.currency}</td>
                  <td>{row.orders}</td>
                  <td>{money(row.total, row.currency)}</td>
                </>
              )}
            />
          </section>
        </div>
      )}
    </Resource>
  );
}
export function Admin() {
  const [active, setActive] = useState('Overview');
  const tabs = { Overview, Sellers: Shops, Plans, Moderation, Support: AdminTickets, Audit };
  const Screen = tabs[active];
  return (
    <>
      <div className="site-nav">
        <div className="wrap site-nav-inner">
          <Brand />
          <Button tone="secondary" href="/dashboard">
            <FiArrowLeft /> Seller workspace
          </Button>
        </div>
      </div>
      <main className="wrap home-section stack-lg" id="main-content">
        <Heading
          eyebrow="Platform"
          title="ShopOS administration"
          description="Manage store access, platform plans, listings, and seller support."
        />
        <div className="pill-tabs" aria-label="Admin sections">
          {Object.keys(tabs).map((tab) => (
            <button key={tab} type="button" aria-pressed={tab === active} onClick={() => setActive(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <Screen />
      </main>
    </>
  );
}
