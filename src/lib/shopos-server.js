import 'server-only';
import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';
import { ObjectId } from 'mongodb';
import { auth } from './auth';
import clientPromise from './mongodb';

export const backend = () =>
  (process.env.SHOPOS_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(
    /\/$/,
    '',
  );
export const siteOrigin = () =>
  (process.env.BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
export async function storefrontRequest() {
  const incoming = await headers();
  const country = incoming.get('x-vercel-ip-country') || '';
  const canonical = new URL(siteOrigin());
  const customHost =
    incoming.get('host') !== canonical.host &&
    (process.env.ENABLE_CUSTOM_DOMAINS === 'true' || !!process.env.SHOPOS_ROOT_DOMAIN);
  return {
    buyerCountry: /^[A-Z]{2}$/.test(country) ? country : undefined,
    accountOrigin: customHost ? canonical.origin : '',
  };
}
export const accountFilter = (id) => ({
  $or: [{ _id: id }, ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])],
});
export const userCollection = async () =>
  (await clientPromise).db(process.env.MONGODB_DB || 'shopOS').collection('user');
export async function identity(requestHeaders) {
  const supplied = requestHeaders || (await headers());
  if (!supplied.get('cookie') && !supplied.get('authorization')) return null;
  const session = await auth.api.getSession({ headers: supplied, query: { disableCookieCache: true } });
  if (!session?.user?.id) return null;
  const user = session.user;
  const doc = await (
    await userCollection()
  ).findOne(accountFilter(user.id), { projection: { role: 1, isBlocked: 1 } });
  if (!doc) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    role: doc.role || 'user',
    blocked: doc.isBlocked === true,
  };
}
export function signedHeaders(user) {
  if (!user) return {};
  const secret = process.env.SHOPOS_PROXY_SECRET;
  if (!secret) throw new Error('Set the same SHOPOS_PROXY_SECRET in both projects');
  const payload = Buffer.from(JSON.stringify({ ...user, issuedAt: Date.now() })).toString('base64url');
  return {
    'x-shopos-user': payload,
    'x-shopos-signature': createHmac('sha256', secret).update(payload).digest('hex'),
  };
}
export async function apiServer(path, user) {
  try {
    const response = await fetch(`${backend()}${path}`, {
      cache: 'no-store',
      headers: signedHeaders(user),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
