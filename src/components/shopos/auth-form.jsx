'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiEye, FiEyeOff, FiPackage } from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import { Brand, Button, Field, Notice, Rise } from './ui';

function safePath(value, fallback) {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\')
    ? value
    : fallback;
}
export function AuthForm({ mode, shopSlug, shopName, redirectTo, google }) {
  const register = mode === 'register';
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [visible, setVisible] = useState(false);
  const base = shopSlug ? `/shops/${shopSlug}` : '';
  const destination = safePath(redirectTo, base || '/dashboard');
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = register
        ? await authClient.signUp.email({
            name: data.name,
            email: data.email,
            password: data.password,
            ...(shopSlug ? { shopSlug } : {}),
          })
        : await authClient.signIn.email({ email: data.email, password: data.password });
      if (result.error) throw new Error(result.error.message || 'Could not sign in');
      if (register && !shopSlug) {
        const activation = await fetch('/api/become-seller', { method: 'POST' });
        if (!activation.ok)
          throw new Error((await activation.json()).error || 'Seller activation failed');
      }
      router.replace(destination);
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function googleSignIn() {
    setError('');
    setBusy(true);
    try {
      const result = await authClient.signIn.social({ provider: 'google', callbackURL: destination });
      if (result.error) throw new Error(result.error.message);
    } catch (error) {
      setError(error.message || 'Google sign-in failed');
      setBusy(false);
    }
  }
  return (
    <main id="main-content" className="auth-shell">
      <div className="auth-content">
        <Brand href={base || '/'} />
        <Rise className="auth-form-area">
          <Link href={base || '/'} className="auth-back">
            <FiArrowLeft /> {shopName || 'ShopOS'}
          </Link>
          <h1>{register ? (shopSlug ? 'Create an account' : 'Start your store') : 'Welcome back'}</h1>
          <p className="lede">
            {register
              ? shopSlug
                ? 'Keep your orders in one place.'
                : 'Create your seller account to open a ShopOS store.'
              : shopSlug
                ? `Sign in to ${shopName || 'this shop'}.`
                : 'Sign in to your ShopOS workspace.'}
          </p>
          <form className="stack" onSubmit={submit}>
            {register && <Field label="Full name" name="name" autoComplete="name" required />}
            <Field label="Email address" name="email" type="email" autoComplete="email" required />
            <Field label="Password" hint={register ? 'Use at least 8 characters.' : null}>
              <div className="password-field">
                <input
                  name="password"
                  type={visible ? 'text' : 'password'}
                  minLength={register ? 8 : undefined}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  aria-label={visible ? 'Hide password' : 'Show password'}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </Field>
            <Notice tone="error">{error}</Notice>
            <Button type="submit" disabled={busy}>
              {busy ? 'Working…' : register ? 'Create account' : 'Sign in'} <FiArrowRight />
            </Button>
            {google && (
              <Button tone="secondary" disabled={busy} onClick={googleSignIn}>
                Continue with Google
              </Button>
            )}
          </form>
          <p className="muted fine">
            {register ? 'Already have an account?' : 'New here?'}{' '}
            <Link
              href={`${base}/${register ? 'login' : 'registration'}${redirectTo ? `?redirect=${encodeURIComponent(destination)}` : ''}`}
            >
              {register ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </Rise>
      </div>
      <aside className="auth-visual">
        <div>
          <FiPackage />
          <h2>{shopName || 'A better way to run your shop.'}</h2>
          <p>
            {shopSlug ? 'Your next order starts here.' : 'From your first product to your next market.'}
          </p>
        </div>
      </aside>
    </main>
  );
}
