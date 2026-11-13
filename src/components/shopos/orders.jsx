'use client';

import { useState } from 'react';
import { FiChevronDown, FiTruck } from 'react-icons/fi';
import { Button, Empty, External, Field, Heading, Loading, Notice, Rise, Status } from './ui';
import { Feedback, NeedShop, Resource, useMutation, useShopResource, useWorkspace } from './workspace';
import {
  courierLabels,
  dateLabel,
  getFields,
  money,
  paymentLabels,
  request,
  shopPath,
} from '@/lib/shopos';

const nextStates = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
};
function OrderDetail({ order, reload, providers }) {
  const { slug, owner } = useWorkspace();
  const action = useMutation(reload),
    rating = useMutation();
  const [trackingLink, setTrackingLink] = useState('');
  const [courier, setCourier] = useState(''),
    [rates, setRates] = useState([]),
    [city, setCity] = useState(''),
    [zone, setZone] = useState('');
  const cities = useShopResource(courier === 'pathao' ? '/couriers/pathao/areas' : null);
  const zones = useShopResource(
    courier === 'pathao' && city ? `/couriers/pathao/areas?city=${city}` : null,
  );
  const areas = useShopResource(
    courier === 'pathao' && zone ? `/couriers/pathao/areas?zone=${zone}` : null,
  );
  const redxAreas = useShopResource(courier === 'redx' ? '/couriers/redx/areas' : null);
  const path = shopPath(slug, `/orders/${order.id}`);
  async function getTrackingLink() {
    try {
      const { url } = await request(`${path}/tracking-link`);
      setTrackingLink(url);
    } catch (error) {
      action.setMessage({ tone: 'error', text: error.message });
    }
  }
  const options = Object.keys(courierLabels).filter(
    (key) => providers[key]?.configured && (order.paymentMethod !== 'cod' || key !== 'shippo'),
  );
  async function dispatch(event) {
    event.preventDefault();
    const values = getFields(event.currentTarget);
    if (courier === 'redx')
      values.areaName = redxAreas.data?.find((item) => String(item.id) === values.area)?.name;
    await action.mutate(
      `${path}/courier`,
      'POST',
      { ...values, provider: courier },
      'Consignment created.',
    );
  }
  return (
    <Rise className="order-detail">
      <div className="grid-2">
        <div className="muted-block">
          <h3>Delivery details</h3>
          <p>
            {order.customer.name} · {order.customer.phone}
          </p>
          {order.customer.email && <p className="break">{order.customer.email}</p>}
          <p>
            {[
              order.customer.address,
              order.customer.city,
              order.customer.postcode,
              order.customer.country,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
        <div className="muted-block">
          <h3>Order summary</h3>
          {order.items.map((item, index) => (
            <div className="detail-row" key={index}>
              <span>
                {item.name}
                {item.variantName ? ` · ${item.variantName}` : ''} × {item.qty}
              </span>
              <strong>
                {money(((item.unitMinor ?? item.price * 100) * item.qty) / 100, order.currency)}
              </strong>
            </div>
          ))}
          {order.shippingTotal > 0 && (
            <div className="detail-row">
              <span>Shipping</span>
              <strong>{money(order.shippingTotal, order.currency)}</strong>
            </div>
          )}
          {order.discount > 0 && (
            <div className="detail-row">
              <span>Discount {order.discountCode}</span>
              <strong>{money(order.discount, order.currency)}</strong>
            </div>
          )}
        </div>
      </div>
      <div className="row">
        <Status value={order.status} />
        <Status value={order.paymentStatus} />
        {nextStates[order.status]
          ?.filter(
            (status) =>
              status === 'cancelled' ||
              status === 'returned' ||
              order.paymentMethod === 'cod' ||
              order.paymentStatus === 'paid',
          )
          .map((status) => (
            <Button
              key={status}
              tone={['cancelled', 'returned'].includes(status) ? 'danger' : 'secondary'}
              disabled={action.busy}
              onClick={() => {
                if (
                  !['cancelled', 'returned'].includes(status) ||
                  window.confirm(`Mark this order ${status}?`)
                )
                  action.mutate(path, 'PATCH', { status }, 'Order updated.');
              }}
            >
              {
                {
                  confirmed: 'Confirm',
                  shipped: 'Mark shipped',
                  delivered: 'Mark delivered',
                  cancelled: 'Cancel order',
                  returned: 'Mark returned',
                }[status]
              }
            </Button>
          ))}
      </div>
      {order.paymentStatus === 'review' && (
        <Notice tone="warn">
          The provider flagged this payment. Check it in the provider dashboard before fulfillment.
        </Notice>
      )}
      {order.paymentStatus === 'refund_due' && (
        <Notice tone="warn">
          This paid order was cancelled or returned. Reconcile the refund in the provider dashboard.
        </Notice>
      )}
      {order.courier ? (
        <div className="row muted-block">
          <FiTruck />
          <strong>{courierLabels[order.courier.provider] || order.courier.provider}</strong>
          <span>{order.courier.trackingCode || order.courier.consignmentId}</span>
          <Status value={order.courier.status} />
          {order.courier.trackingUrl && (
            <External href={order.courier.trackingUrl}>Track shipment</External>
          )}
          {order.courier.labelUrl && <External href={order.courier.labelUrl}>Shipping label</External>}
          <Button
            tone="secondary"
            disabled={action.busy}
            onClick={() => action.mutate(`${path}/courier/sync`, 'POST', {}, 'Tracking updated.')}
          >
            Sync tracking
          </Button>
        </div>
      ) : order.courierIssue ? (
        <div className="stack">
          <Notice tone="warn">{order.courierIssue}</Notice>
          {owner && (
            <div>
              <Button
                tone="secondary"
                onClick={() => {
                  if (
                    window.confirm(
                      'Confirm that there is no consignment for this order in the provider dashboard.',
                    )
                  )
                    action.mutate(
                      `${path}/courier/unlock`,
                      'POST',
                      { checked: true },
                      'Courier request unlocked.',
                    );
                }}
              >
                Unlock after reconciliation
              </Button>
            </div>
          )}
        </div>
      ) : (
        options.length > 0 &&
        ['pending', 'confirmed'].includes(order.status) &&
        (order.paymentMethod === 'cod' || order.paymentStatus === 'paid') && (
          <form className="stack muted-block" onSubmit={dispatch}>
            <h3>Dispatch this order</h3>
            <Field label="Courier">
              <select
                value={courier}
                onChange={(event) => {
                  setCourier(event.target.value);
                  setRates([]);
                }}
                required
              >
                <option value="">Choose courier</option>
                {options.map((key) => (
                  <option value={key} key={key}>
                    {courierLabels[key]}
                  </option>
                ))}
              </select>
            </Field>
            {courier === 'pathao' && (
              <div className="fields fields-3">
                <Field label="City">
                  <select
                    name="city"
                    required
                    value={city}
                    onChange={(event) => {
                      setCity(event.target.value);
                      setZone('');
                    }}
                  >
                    <option value="">Choose city</option>
                    {cities.data?.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Zone">
                  <select
                    name="zone"
                    required
                    value={zone}
                    onChange={(event) => setZone(event.target.value)}
                  >
                    <option value="">Choose zone</option>
                    {zones.data?.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Area">
                  <select name="area">
                    <option value="">Choose area</option>
                    {areas.data?.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="field-span">
                  <Notice tone="error">{cities.error || zones.error || areas.error}</Notice>
                </div>
              </div>
            )}
            {courier === 'redx' && (
              <>
                <Field label="RedX delivery area">
                  <select name="area" required>
                    <option value="">Choose area</option>
                    {redxAreas.data?.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Notice tone="error">{redxAreas.error}</Notice>
              </>
            )}
            {courier === 'shippo' && (
              <>
                <div>
                  <Button
                    tone="secondary"
                    disabled={rating.busy}
                    onClick={async () => {
                      const result = await rating.mutate(`${path}/rates`, 'POST', {});
                      if (result) setRates(result);
                    }}
                  >
                    Get Shippo rates
                  </Button>
                </div>
                <Feedback action={rating} />
                {rates.length > 0 && (
                  <Field label="Shipping service">
                    <select name="rateId" required>
                      {rates.map((rate) => (
                        <option value={rate.id} key={rate.id}>
                          {rate.provider} {rate.service} · {money(rate.amount, rate.currency)}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              </>
            )}
            <div>
              <Button
                type="submit"
                disabled={!courier || action.busy || (courier === 'shippo' && !rates.length)}
              >
                <FiTruck /> {courier === 'shippo' ? 'Buy shipping label' : 'Dispatch order'}
              </Button>
            </div>
          </form>
        )
      )}
      <div className="row">
        <Button tone="secondary" onClick={getTrackingLink}>
          Get guest tracking link
        </Button>
        {trackingLink && <External href={trackingLink}>Open tracking link</External>}
      </div>
      {trackingLink && (
        <Field
          label="Guest tracking link"
          value={trackingLink}
          readOnly
          onFocus={(event) => event.target.select()}
        />
      )}
      <Feedback action={action} />
    </Rise>
  );
}
export function Orders() {
  const [status, setStatus] = useState(''),
    [open, setOpen] = useState(null),
    [offset, setOffset] = useState(0);
  const source = useShopResource(`/orders?limit=30&skip=${offset}${status ? `&status=${status}` : ''}`),
    settings = useShopResource('/settings');
  return (
    <>
      <Heading
        eyebrow="Sales"
        title="Orders"
        description="Review payments, update fulfillment, and track shipments."
        actions={
          <Field label="Filter status">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setOffset(0);
              }}
            >
              <option value="">All orders</option>
              {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'].map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
        }
      />
      <NeedShop>
        <Resource source={source}>
          {(orders) =>
            orders.length ? (
              <div className="stack">
                {orders.map((order) => (
                  <article key={order.id} className="surface order-card">
                    <button
                      type="button"
                      className="order-summary"
                      aria-expanded={open === order.id}
                      onClick={() => setOpen(open === order.id ? null : order.id)}
                    >
                      <div>
                        <h3>{order.customer.name}</h3>
                        <p className="muted fine">
                          #{order.id.slice(-7)} · {dateLabel(order.createdAt)}
                        </p>
                      </div>
                      <div className="row order-summary-status">
                        <Status value={order.status} />
                        <span className="fine muted">
                          {paymentLabels[order.paymentMethod] || order.paymentMethod}
                        </span>
                      </div>
                      <strong>{money(order.total, order.currency)}</strong>
                      <FiChevronDown aria-hidden="true" />
                    </button>
                    {open === order.id && (
                      <OrderDetail
                        order={order}
                        reload={source.reload}
                        providers={settings.data?.providers || {}}
                      />
                    )}
                  </article>
                ))}
                {(offset > 0 || orders.length === 30) && (
                  <div className="row">
                    <Button tone="secondary" disabled={!offset} onClick={() => setOffset(offset - 30)}>
                      Previous
                    </Button>
                    <Button
                      tone="secondary"
                      disabled={orders.length < 30}
                      onClick={() => setOffset(offset + 30)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <section className="surface">
                <Empty
                  title="No orders match this view"
                  description="Orders will appear when a customer checks out."
                />
                {offset > 0 && (
                  <Button tone="secondary" onClick={() => setOffset(offset - 30)}>
                    Previous
                  </Button>
                )}
              </section>
            )
          }
        </Resource>
      </NeedShop>
    </>
  );
}
