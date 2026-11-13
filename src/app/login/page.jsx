import { AuthForm } from '@/components/shopos/auth-form';
export const metadata = { title: 'Sign in' };
export default async function Page({ searchParams }) {
  const { redirect } = await searchParams;
  return (
    <AuthForm
      mode="login"
      redirectTo={redirect}
      google={!!(process.env.CLIENT_ID && process.env.CLIENT_SECRET)}
    />
  );
}
