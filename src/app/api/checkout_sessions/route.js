import { backend } from '@/lib/shopos-server';
export async function POST(request) {
  const input = await request.json().catch(() => ({}));
  if (
    !/^[a-z0-9-]{2,55}$/.test(input.shopSlug || '') ||
    !/^[a-f0-9]{24}$/i.test(input.orderId || '') ||
    !/^[a-f0-9]{64}$/.test(input.token || '')
  )
    return Response.json({ error: 'A valid order and checkout token are required' }, { status: 400 });
  const response = await fetch(`${backend()}/shops/${input.shopSlug}/orders/${input.orderId}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: input.token }),
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  }).catch(() => null);
  if (!response) return Response.json({ error: 'Checkout is temporarily unavailable' }, { status: 502 });
  return new Response(response.body, {
    status: response.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
  });
}
