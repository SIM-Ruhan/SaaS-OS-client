'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiArrowDownRight,
  FiArrowRight,
  FiArrowUpRight,
  FiBarChart2,
  FiCheck,
  FiChevronDown,
  FiCreditCard,
  FiGlobe,
  FiLayers,
  FiMenu,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiX,
} from 'react-icons/fi';
import { Brand, Button, Rise } from './ui';
import { authClient } from '@/lib/auth-client';
import { money } from '@/lib/shopos';

export function SiteNav({ compact = false }) {
  const [open, setOpen] = useState(false);
  const { data } = authClient.useSession();
  const links = [
    ['Features', '/#features'],
    ['Pricing', '/#pricing'],
    ['Explore shops', '/shops'],
  ];
  return (
    <header className="site-nav">
      <div className="wrap site-nav-inner">
        <Brand />
        {!compact && (
          <nav className="site-links" aria-label="Main navigation">
            {links.map(([label, href]) => (
              <Link key={label} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        )}
        <div className="site-actions">
          {data?.user ? (
            <Button href="/dashboard">
              Dashboard <FiArrowUpRight />
            </Button>
          ) : (
            <>
              <Button tone="quiet" href="/login">
                Sign in
              </Button>
              <Button href="/registration">
                Start selling <FiArrowUpRight />
              </Button>
            </>
          )}
        </div>
        <button
          type="button"
          className="icon-button site-menu"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="site-mobile-nav"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="site-mobile-nav"
            className="wrap site-mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {links.map(([label, href]) => (
              <Link key={label} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href={data?.user ? '/dashboard' : '/login'}>
              {data?.user ? 'Dashboard' : 'Sign in'}
            </Link>
            {!data?.user && <Button href="/registration">Start selling</Button>}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer-inner">
        <div>
          <Brand light />
          <p>Commerce for independent sellers.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/#features">Features</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/shops">Explore shops</Link>
          <Link href="/dashboard">Seller dashboard</Link>
        </nav>
        <small>© ShopOS</small>
      </div>
    </footer>
  );
}
const capabilities = [
  {
    title: 'Build a store that feels like yours',
    text: 'Publish your storefront and reorder the sections of a product landing page in a live editor.',
    icon: FiLayers,
    color: 'lime',
  },
  {
    title: 'Give buyers more ways to pay',
    text: 'Offer cash on delivery, local online payments, or international checkout with the providers you connect.',
    icon: FiCreditCard,
    color: 'sand',
  },
  {
    title: 'Get every order out the door',
    text: 'Manage stock and shipments, request courier rates, and keep tracking updates together.',
    icon: FiTruck,
    color: 'green',
  },
  {
    title: 'See what brings customers in',
    text: 'Measure sales, campaign traffic, and landing page variants using your own store data.',
    icon: FiBarChart2,
    color: 'green',
  },
  {
    title: 'Find your next product',
    text: 'Compare dated demand signals, market prices, competition, and your suppliers.',
    icon: FiGlobe,
    color: 'sand',
  },
  {
    title: 'Grow through referrals',
    text: 'Give partners referral links and track commissions on their paid orders.',
    icon: FiShoppingBag,
    color: 'lime',
  },
];
const questions = [
  [
    'Do I need an online payment account to get started?',
    'You can create a store, add products, and take cash-on-delivery orders first. Connect a merchant account when you’re ready to accept online payments.',
  ],
  [
    'Can I import an existing product catalog?',
    'Yes. Upload a CSV, match the source columns, and check the preview before importing. You can also upload a ZIP of photos with filenames that match your SKUs.',
  ],
  [
    'Can I sell from my own domain?',
    'You can connect a verified custom domain to your store or a published product landing page. The domain also needs to point to your ShopOS hosting project.',
  ],
  [
    'Can shoppers check out without an account?',
    'Yes. Guest checkout is available. A customer account also lets shoppers view orders linked to that account.',
  ],
];
export function Home({ plans }) {
  const [cadence, setCadence] = useState('monthly');
  const [question, setQuestion] = useState(null);
  return (
    <>
      <SiteNav />
      <main id="main-content">
        <section className="wrap home-hero">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              <span />
              Built for independent sellers
            </p>
            <h1>
              Your shop.
              <br />
              Your way <em>to grow.</em>
            </h1>
            <p className="hero-description">
              Launch an online store and run the work behind it. Products, checkout, delivery, and growth
              tools live together in ShopOS.
            </p>
            <div className="row hero-buttons">
              <Button href="/registration">
                Create your store <FiArrowRight />
              </Button>
              <Button href="/shops" tone="secondary">
                Explore shops <FiArrowUpRight />
              </Button>
            </div>
            <div className="hero-foot">
              <FiCheck aria-hidden="true" /> Start with a free trial and publish when you’re ready.
            </div>
          </div>
          <div className="hero-photo">
            <Image
              src="/media/shopos-merchant.webp"
              alt="An independent seller preparing a ceramic cup for shipping"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 52vw"
            />
            <div className="photo-note">
              <span>
                <FiPackage aria-hidden="true" />
              </span>
              <div>
                <strong>From catalog to delivery</strong>
                <small>One workspace for your shop</small>
              </div>
            </div>
          </div>
        </section>
        <section className="home-strip">
          <div className="wrap">
            <span>
              <FiShoppingBag /> Storefront &amp; catalog
            </span>
            <span>
              <FiCreditCard /> Payments &amp; COD
            </span>
            <span>
              <FiTruck /> Shipping &amp; tracking
            </span>
            <span>
              <FiBarChart2 /> Analytics &amp; research
            </span>
          </div>
        </section>
        <section id="features" className="wrap home-section">
          <header className="home-section-head">
            <div>
              <p className="eyebrow">The seller workspace</p>
              <h2>Run your shop in one place.</h2>
            </div>
            <p>
              Start with the storefront. Add the tools you need as your orders, team, and markets grow.
            </p>
          </header>
          <div className="home-feature-grid">
            {capabilities.map((feature, index) => (
              <Rise
                key={feature.title}
                className={`feature feature-${feature.color}`}
                delay={index * 0.035}
              >
                <div className="feature-icon">
                  <feature.icon aria-hidden="true" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </Rise>
            ))}
          </div>
        </section>
        <section id="pricing" className="home-pricing">
          <div className="wrap home-section">
            <header className="home-section-head">
              <div>
                <p className="eyebrow">Pricing</p>
                <h2>Choose a plan for your shop.</h2>
              </div>
              <div className="pill-tabs" aria-label="Billing interval">
                {[
                  ['monthly', 'Monthly'],
                  ['yearly', 'Yearly'],
                  ['lifetime', 'One time'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={cadence === key}
                    onClick={() => setCadence(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </header>
            {plans ? (
              <div className="grid-3">
                {Object.entries(plans)
                  .filter(([key]) => !['free', 'currency'].includes(key))
                  .map(([key, plan]) => (
                    <div
                      key={key}
                      className={`pricing-card ${key === 'growth' ? 'pricing-highlight' : ''}`}
                    >
                      <h3>{plan.name}</h3>
                      <p className="plan-price">
                        {money(plan[cadence], plans.currency || 'BDT')}{' '}
                        <span>
                          {cadence === 'monthly' ? '/ month' : cadence === 'yearly' ? '/ year' : 'once'}
                        </span>
                      </p>
                      <ul>
                        <li>
                          <FiCheck />
                          {plan.products.toLocaleString()} products
                        </li>
                        <li>
                          <FiCheck />
                          {plan.pages} landing pages
                        </li>
                        <li>
                          <FiCheck />
                          {plan.seats} team seats
                        </li>
                      </ul>
                      <Button href="/registration" tone={key === 'growth' ? 'lime' : 'secondary'}>
                        Start selling <FiArrowUpRight />
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="surface">
                <p>Set up your shop first. Plan pricing is available in your seller dashboard.</p>
                <Button href="/registration" className="mt-4">
                  Create your store
                </Button>
              </div>
            )}
          </div>
        </section>
        <section className="wrap home-section home-faq">
          <div>
            <p className="eyebrow">Before you start</p>
            <h2>Common questions.</h2>
          </div>
          <div className="stack">
            {questions.map(([title, answer], index) => (
              <article key={title} className="faq-item">
                <h3>
                  <button
                    type="button"
                    aria-expanded={question === index}
                    aria-controls={`answer-${index}`}
                    onClick={() => setQuestion(question === index ? null : index)}
                  >
                    {title}
                    <FiChevronDown aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {question === index && (
                    <motion.div
                      id={`answer-${index}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="faq-answer"
                    >
                      <p>{answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            ))}
          </div>
        </section>
        <section className="wrap home-final">
          <div>
            <p className="eyebrow">Get started</p>
            <h2>Open your shop on ShopOS.</h2>
          </div>
          <Button href="/registration" tone="lime">
            Create your store <FiArrowDownRight />
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
