import { identity } from '@/lib/shopos-server';
export async function GET(request) {
  const user = await identity(request.headers);
  if (!user || user.blocked) return Response.json({ error: 'Sign in to continue' }, { status: 401 });
  return Response.json(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
