const allowed = () =>
  (process.env.MOBILE_WEB_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
export function applyMobileCors(request, response) {
  const origin = request.headers.get('origin');
  if (!origin || !allowed().includes(origin)) return response;
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Expose-Headers', 'Set-Auth-Token, Content-Disposition');
  headers.append('Vary', 'Origin');
  return new Response(response.body, { status: response.status, headers });
}
export function mobileOptions(request) {
  const origin = request.headers.get('origin');
  if (!origin || !allowed().includes(origin)) return new Response(null, { status: 403 });
  return applyMobileCors(
    request,
    new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '600',
      },
    }),
  );
}
export function browserMutationAllowed(request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;
  const origin = request.headers.get('origin');
  if (!origin) return request.headers.get('sec-fetch-site') !== 'cross-site';
  const host = request.headers.get('host');
  try {
    if (new URL(origin).host === host) return true;
  } catch {
    return false;
  }
  return allowed().includes(origin) && !request.headers.has('cookie');
}
