import { AuthForm } from '@/components/shopos/auth-form';
export const metadata = { title: 'Create your seller account' };
export default async function Page({ searchParams }) {
  const { redirect } = await searchParams;
  return (
    <AuthForm
      mode="register"
      redirectTo={redirect}
      google={!!(process.env.CLIENT_ID && process.env.CLIENT_SECRET)}
    />
  );
}
