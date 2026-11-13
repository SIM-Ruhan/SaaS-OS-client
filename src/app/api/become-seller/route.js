import { accountFilter, identity, userCollection } from '@/lib/shopos-server';
import { browserMutationAllowed } from '@/lib/mobile-cors';

export async function POST(request) {
  if (!browserMutationAllowed(request))
    return Response.json({ error: 'Request origin is not allowed' }, { status: 403 });
  const user = await identity(request.headers);
  if (!user) return Response.json({ error: 'Sign in before creating a shop' }, { status: 401 });
  if (user.blocked) return Response.json({ error: 'This account is suspended' }, { status: 403 });
  const result = await (
    await userCollection()
  ).updateOne({ ...accountFilter(user.id), isBlocked: { $ne: true } }, { $set: { role: 'seller' } });
  if (!result.matchedCount)
    return Response.json({ error: 'Account not found. Sign in again.' }, { status: 404 });
  return Response.json({ success: true, role: 'seller' });
}
