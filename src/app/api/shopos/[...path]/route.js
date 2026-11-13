import { backend, identity, signedHeaders } from '@/lib/shopos-server';
import { applyMobileCors, browserMutationAllowed, mobileOptions } from '@/lib/mobile-cors';

async function handler(request, { params }) {
  if (!browserMutationAllowed(request))
    return Response.json({ error: 'Request origin is not allowed' }, { status: 403 });
  const { path } = await params;
  if (
    !path?.length ||
    path.some((part) => part === '.' || part === '..') ||
    (['payments', 'jobs', 'domains'].includes(path[0]) &&
      !(path[0] === 'payments' && path[1] === 'order'))
  )
    return Response.json({ error: 'Route not available through this proxy' }, { status: 404 });
  const url = new URL(`${backend()}/${path.map(encodeURIComponent).join('/')}`);
  url.search = new URL(request.url).search;
  try {
    const user = await identity(request.headers);
    const headers = new Headers(signedHeaders(user));
    if (request.headers.has('content-type'))
      headers.set('content-type', request.headers.get('content-type'));
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
    if (body?.byteLength > 4_250_000)
      return Response.json({ error: 'Use an upload smaller than 4.25 MB' }, { status: 413 });
    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(55_000),
    });
    const outgoing = new Headers({ 'Cache-Control': 'private, no-store' });
    for (const key of ['content-type', 'content-disposition'])
      if (response.headers.has(key)) outgoing.set(key, response.headers.get(key));
    return applyMobileCors(
      request,
      new Response(response.body, { status: response.status, headers: outgoing }),
    );
  } catch (error) {
    console.error('ShopOS proxy request failed', error.name);
    return applyMobileCors(
      request,
      Response.json(
        {
          error: error.message?.startsWith('Set the same SHOPOS')
            ? error.message
            : 'The ShopOS API is unavailable. Check the client and server configuration.',
        },
        { status: 502 },
      ),
    );
  }
}
export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
export const OPTIONS = mobileOptions;
