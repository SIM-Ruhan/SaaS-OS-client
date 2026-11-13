export async function GET(request) {
  const current = new URL(request.url),
    destination = new URL('/payment-success', current.origin);
  for (const key of ['gateway', 'order', 'token', 'shop', 'session_id'])
    if (current.searchParams.has(key)) destination.searchParams.set(key, current.searchParams.get(key));
  return Response.redirect(destination, 303);
}
