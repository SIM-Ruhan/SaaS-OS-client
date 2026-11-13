'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { Button, Field, Heading, Notice, Rise } from '@/components/shopos/ui';
import { useWorkspace } from '@/components/shopos/workspace';
import { currencies, request, slugify } from '@/lib/shopos';

export default function CreateShop() {
  const router = useRouter();
  const { reloadShops } = useWorkspace();
  const [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    country: 'BD',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    language: 'en',
    logoUrl: '',
  });
  const [logo, setLogo] = useState(null);
  const change = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  async function submit(event) {
    event.preventDefault();
    setError('');
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      const activation = await fetch('/api/become-seller', { method: 'POST' });
      if (!activation.ok) throw new Error((await activation.json()).error || 'Seller activation failed');
      const data = logo ? new FormData() : form;
      if (logo) {
        for (const [name, value] of Object.entries(form)) data.set(name, value);
        data.set('logo', logo);
      }
      const shop = await request('/shops', { method: 'POST', data });
      reloadShops();
      router.push(`/dashboard/seller?shop=${shop.slug}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow="Setup"
        title="Create your store"
        description="Add the details your customers will see, then set up your catalog."
      />
      <div className="setup-layout">
        <section className="surface">
          <ol className="setup-steps" aria-label="Setup steps">
            {['Store details', 'Market', 'Review'].map((name, index) => (
              <li key={name} aria-current={step === index ? 'step' : undefined}>
                <span>{index + 1}</span>
                {name}
              </li>
            ))}
          </ol>
          <form className="stack-lg" onSubmit={submit}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                className="stack"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                {step === 0 && (
                  <>
                    <Field
                      label="Store name"
                      value={form.name}
                      required
                      minLength={2}
                      maxLength={100}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          name: event.target.value,
                          slug:
                            !form.slug || form.slug === slugify(form.name)
                              ? slugify(event.target.value)
                              : form.slug,
                        })
                      }
                    />
                    <Field
                      label="Store URL slug"
                      hint="The slug appears after /shops/ in your store URL."
                      value={form.slug}
                      required
                      pattern="[a-z0-9][a-z0-9\-]{1,54}"
                      onChange={(event) => change('slug', slugify(event.target.value))}
                    />
                    <Field label="Description">
                      <textarea
                        value={form.description}
                        onChange={(event) => change('description', event.target.value)}
                      />
                    </Field>
                    <Field
                      label="Logo URL (optional)"
                      type="url"
                      value={form.logoUrl}
                      onChange={(event) => change('logoUrl', event.target.value)}
                    />
                    <Field
                      label="Or upload a logo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      hint={logo?.name || 'Up to 3.5 MB when image uploads are enabled.'}
                      onChange={(event) => setLogo(event.target.files?.[0] || null)}
                    />
                    {logo && (
                      <div>
                        <Button tone="quiet" onClick={() => setLogo(null)}>
                          Use logo URL instead
                        </Button>
                      </div>
                    )}
                  </>
                )}
                {step === 1 && (
                  <div className="fields">
                    <Field
                      label="Country code"
                      hint="For example BD, US, or GB."
                      value={form.country}
                      maxLength={2}
                      pattern="[A-Za-z]{2}"
                      required
                      onChange={(event) => change('country', event.target.value.toUpperCase())}
                    />
                    <Field label="Base currency">
                      <select
                        value={form.currency}
                        onChange={(event) => change('currency', event.target.value)}
                      >
                        {currencies.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      label="Timezone"
                      value={form.timezone}
                      onChange={(event) => change('timezone', event.target.value)}
                    />
                    <Field label="Store language">
                      <select
                        value={form.language}
                        onChange={(event) => change('language', event.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="bn">বাংলা</option>
                      </select>
                    </Field>
                  </div>
                )}
                {step === 2 && (
                  <div className="muted-block">
                    <div className="detail-row">
                      <span>Store</span>
                      <strong>{form.name}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Address</span>
                      <strong className="break">/shops/{form.slug}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Market</span>
                      <strong>
                        {form.country} · {form.currency}
                      </strong>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <Notice tone="error">{error}</Notice>
            <div className="row between">
              {step > 0 ? (
                <Button tone="secondary" onClick={() => setStep(step - 1)}>
                  <FiArrowLeft /> Back
                </Button>
              ) : (
                <Button tone="quiet" href="/dashboard/seller">
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={busy}>
                {busy ? 'Creating store…' : step === 2 ? 'Create store' : 'Continue'} <FiArrowRight />
              </Button>
            </div>
          </form>
        </section>
        <Rise className="surface setup-note">
          <span className="feature-icon">
            <FiShoppingBag />
          </span>
          <h2>{form.name || 'Your new shop'}</h2>
          <p className="muted break">/shops/{form.slug || 'your-store'}</p>
          <p>{form.description || 'Your store description will appear here.'}</p>
        </Rise>
      </div>
    </>
  );
}
