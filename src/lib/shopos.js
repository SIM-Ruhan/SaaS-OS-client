export const currencies = ['BDT', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'INR', 'AED', 'MYR'];
export const paymentLabels = {
  cod: 'Cash on delivery',
  sslcommerz: 'SSLCommerz',
  stripe: 'Stripe card',
  paypal: 'PayPal',
  aamarpay: 'aamarPay',
  bkash: 'bKash',
  shurjopay: 'shurjoPay',
};
export const courierLabels = {
  steadfast: 'Steadfast',
  pathao: 'Pathao Courier',
  redx: 'RedX',
  shippo: 'Shippo',
};
export function money(value, currency = 'BDT') {
  return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 2 }).format(
    Number(value) || 0,
  );
}
export function dateLabel(value) {
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) : '—';
}
export function shopPath(slug, path = '') {
  return `/shops/${encodeURIComponent(slug)}${path}`;
}
export function workspaceLink(path, slug) {
  return `${path}${slug ? `?shop=${encodeURIComponent(slug)}` : ''}`;
}
export async function request(path, options = {}) {
  const { method = 'GET', data, signal } = options;
  const response = await fetch(`/api/shopos${path}`, {
    method,
    signal,
    cache: 'no-store',
    headers:
      data === undefined || data instanceof FormData
        ? undefined
        : { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.code = body.code;
    throw error;
  }
  return body;
}
export function getFields(form) {
  return Object.fromEntries(new FormData(form));
}
export const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 55);
