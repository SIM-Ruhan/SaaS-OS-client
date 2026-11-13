'use client';

import { useState } from 'react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For testing a first product before you commit.',
    monthly: 990,
    yearly: 9900,
    features: [
      'Up to 50 products',
      '1 landing page',
      '1 staff seat',
      'COD + one payment gateway',
      'Standard storefront theme',
    ],
    highlighted: false,
    cta: 'Start with Starter',
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For sellers running ads and scaling order volume.',
    monthly: 2490,
    yearly: 24900,
    features: [
      'Up to 500 products',
      '10 landing pages',
      '5 staff seats',
      'All BD + international gateways',
      'Server-side ad tracking (FB, Google, TikTok)',
      'Sales & courier analytics dashboard',
    ],
    highlighted: true,
    badge: 'Most sellers choose this',
    cta: 'Get started with Growth',
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'For established stores managing several couriers and campaigns.',
    monthly: 4990,
    yearly: 49900,
    features: [
      'Unlimited products',
      'Unlimited landing pages',
      'Unlimited staff seats',
      'Supply & demand intelligence module',
      'Priority courier routing',
      '500 AI credits/month included',
    ],
    highlighted: false,
    cta: 'Scale your store',
  },
];

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 8.5L6.2 11.5L13 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-10 text-[#1B2027]">
      <div className="mx-auto max-w-[90%]">
        {/* Intro */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl leading-[1.15] tracking-tight text-[#1B2027]">
            Plans for the road ahead.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#1B2027]/75">
            Phase 1 is available without subscription billing. The tiers below show the planned roadmap;
            prices and features are not active yet.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="mt-8 mb-14 inline-flex items-center rounded-full border border-[#DEDAD1] bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setYearly(false)}
            aria-pressed={!yearly}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              !yearly ? 'bg-[#1F3A5F] text-white shadow-sm' : 'text-[#1B2027]/70 hover:text-[#1B2027]'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            aria-pressed={yearly}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              yearly ? 'bg-[#1F3A5F] text-white shadow-sm' : 'text-[#1B2027]/70 hover:text-[#1B2027]'
            }`}
          >
            Yearly
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold transition-colors ${
                yearly ? 'bg-white/20 text-white' : 'bg-[#C6862E]/15 text-[#C6862E]'
              }`}
            >
              -17%
            </span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid items-stretch gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const isDark = plan.highlighted;
            const monthlyEquivalent = yearly ? Math.round(plan.yearly / 12) : plan.monthly;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-8 sm:p-9 transition-all duration-300 ${
                  isDark
                    ? 'bg-[#265a39] text-[#F7F6F3] shadow-2xl shadow-[#1F3A5F]/20 md:-my-4 md:py-12 border border-[#1F3A5F]'
                    : 'bg-white text-[#1B2027] border border-[#DEDAD1] shadow-sm hover:shadow-md hover:border-[#1B2027]/30'
                }`}
              >
                <div>
                  {/* Badge */}
                  {plan.highlighted && (
                    <div className="mb-6">
                      <span className="inline-block rounded-full bg-[#C6862E] px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase shadow-sm">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <h3 className="font-sans text-xl font-bold">{plan.name}</h3>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${
                      isDark ? 'text-[#F7F6F3]/75' : 'text-[#1B2027]/70'
                    }`}
                  >
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-sans text-3xl font-extrabold tracking-tight">
                      ৳{monthlyEquivalent.toLocaleString()}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isDark ? 'text-[#F7F6F3]/65' : 'text-[#1B2027]/60'
                      }`}
                    >
                      /month
                    </span>
                  </div>
                  <p className={`mt-1.5 text-xs ${isDark ? 'text-[#F7F6F3]/60' : 'text-[#1B2027]/55'}`}>
                    {yearly ? `Billed ৳${plan.yearly.toLocaleString()} per year` : 'Billed monthly'}
                  </p>

                  {/* Features */}
                  <div
                    className={`mt-8 border-t pt-6 ${
                      isDark ? 'border-white/10' : 'border-[#DEDAD1]/60'
                    }`}
                  >
                    <ul className="flex flex-col gap-3.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <CheckIcon
                            className={`mt-0.5 h-4 w-4 flex-none ${
                              isDark ? 'text-[#C6862E]' : 'text-[#C6862E]'
                            }`}
                          />
                          <span className={isDark ? 'text-[#F7F6F3]/90' : 'text-[#1B2027]/85'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Button */}
                <button
                  type="button"
                  className={`mt-8 w-full rounded-full py-3.5 px-6 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                    isDark
                      ? 'bg-white text-[#1F3A5F] hover:bg-slate-100 shadow-md'
                      : 'border border-[#1B2027]/20 bg-transparent text-[#1B2027] hover:bg-[#1B2027] hover:text-white'
                  }`}
                >
                  Coming in a later phase
                </button>
              </div>
            );
          })}
        </div>

        {/* Footnote */}
        <p className="mt-14 text-center text-sm leading-relaxed text-[#1B2027]/60 max-w-xl mx-auto">
          Subscription and lifetime billing are planned for a later phase. For Phase 1,{' '}
          <a
            href="#contact"
            className="font-medium text-[#1F3A5F] underline underline-offset-4 hover:text-[#C6862E] transition-colors"
          >
            contact us for details
          </a>
          .
        </p>
      </div>
    </section>
  );
}
