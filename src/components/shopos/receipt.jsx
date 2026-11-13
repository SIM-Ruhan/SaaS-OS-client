import { FiCheck, FiClock, FiShoppingBag } from 'react-icons/fi';
import { apiServer } from '@/lib/shopos-server';
import { money, shopPath } from '@/lib/shopos';
import { Button, External, Status } from './ui';
import { ReceiptActions } from './checkout';
export async function Receipt({ values, slug }) {
  const id = values.order,
    token = values.token;
  const order =
    id && token
      ? await apiServer(
          `/payments/order/${encodeURIComponent(id)}/status?token=${encodeURIComponent(token)}`,
        )
      : null;
  const verified =
    order?.paymentMethod === 'stripe' && values.session_id && token && order.paymentStatus === 'pending'
      ? await apiServer(
          `/payments/stripe/session/${encodeURIComponent(values.session_id)}?token=${encodeURIComponent(token)}`,
        )
      : null;
  const result = verified || order;
  const shop = result ? await apiServer(shopPath(result.shopSlug)) : null;
  const confirmed =
    result && result.status !== 'cancelled' && ['paid', 'cod_pending'].includes(result.paymentStatus);
  const title = !result
    ? 'Order link unavailable'
    : result.status === 'cancelled'
      ? 'Order cancelled'
      : result.paymentStatus === 'review'
        ? 'Payment under review'
        : confirmed
          ? 'Order received'
          : 'Payment awaiting confirmation';
  return (
    <main className="wrap shop-main receipt" id="main-content">
      <ReceiptActions shop={shop} order={result} />
      <section className="surface stack">
        <div className="feature-icon">
          {confirmed ? <FiCheck /> : result ? <FiClock /> : <FiShoppingBag />}
        </div>
        <h1>{title}</h1>
        {result ? (
          <>
            <div className="row">
              <Status value={result.status} />
              <Status value={result.paymentStatus} />
            </div>
            <p className="muted">
              {confirmed
                ? 'Keep this link to check delivery updates.'
                : result.status === 'cancelled'
                  ? 'Contact the seller if you already paid for this order.'
                  : 'If you just paid, refresh after the provider confirms the transaction.'}
            </p>
            <div className="detail-row">
              <span>Order reference</span>
              <strong className="mono">{result.id}</strong>
            </div>
            <div className="detail-row">
              <span>Total</span>
              <strong>{money(result.total, result.currency)}</strong>
            </div>
            {result.courier && (
              <div className="detail-row">
                <span>Tracking</span>
                <strong>
                  {result.courier.trackingCode || result.courier.status}{' '}
                  {result.courier.trackingUrl && (
                    <External href={result.courier.trackingUrl}>Track</External>
                  )}
                </strong>
              </div>
            )}
            {confirmed && (
              <details>
                <summary className="cursor-pointer fine">Guest order token</summary>
                <code>{token}</code>
              </details>
            )}
          </>
        ) : (
          <p className="muted">Open the original tracking link or check your signed-in order history.</p>
        )}
        <div className="row">
          <Button href={shopPath(result?.shopSlug || slug || '').replace(/\/$/, '')}>
            Continue shopping
          </Button>
          {result && !confirmed && result.paymentStatus === 'pending' && (
            <a
              className="button button-secondary"
              href={`?${new URLSearchParams(Object.entries(values).filter(([, value]) => typeof value === 'string'))}`}
            >
              Refresh status
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
