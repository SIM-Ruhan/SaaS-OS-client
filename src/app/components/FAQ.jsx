'use client';

import { useState } from 'react';

const faqs = [
 
  {
    id: 'coding-skills',
    question: 'Do I need coding skills to use ShopOS?',
    answer:
      'Not at all. ShopOS is fully compatible with Elementor, Gutenberg and WPBakery, which means you can build and customize pages visually with drag-and-drop editors. Even beginners can create a professional store without touching code.',
  },
  {
    id: 'speed-performance',
    question: 'Will my store be fast and optimized?',
    answer:
      'Yes. ShopOS is built with performance in mind — lightweight structure, AJAX technology, and SEO-friendly code. With proper hosting and caching, your website can achieve excellent loading speeds.',
  },
  {
    id: 'plugin-compatibility',
    question: 'Is ShopOS compatible with popular plugins?',
    answer:
      'Absolutely. ShopOS is tested with the most widely used MERN and WooCommerce plugins, including WPML, Yoast SEO, Mailchimp, and caching solutions. Our team ensures ongoing compatibility with WordPress updates.',
  },
  {
    id: 'lifetime-updates',
    question: 'How reliable is your support and “lifetime updates”?',
    answer:
      'When you buy ShopOS, you get lifetime theme updates at no extra cost. Our dedicated support team is highly rated (4.9/5 stars) and ready to help you through our ticket system and documentation.',
  },
  {
    id: 'ecommerce-features',
    question: 'Will I need additional ecommerce plugins?',
    answer:
      'No. ShopOS is an all-in-one solution for WooCommerce. It comes with essential ecommerce features and functionality built-in.',
    listItems: [
      'Product variations',
      'AJAX-powered product search',
      'Off-canvas filters sidebar',
      'Product video galleries',
      'Mega menus',
      'Recent Product galleries',
      'Featured Product galleries',
      'Image hotspots',
      'Pricing tables',
      'Lookbooks',
      '360-degree product viewer',
      'Sticky add-to-cart',
    ],
    footnote: 'Check out our demos to see all of these elements and more in action.',
  },
  {
    id: 'digital-products',
    question: 'Can I use the ShopOS theme to sell digital products?',
    answer: 'Yes. You can sell any type of product, physical or digital with ShopOS.',
  },
];

function ChevronIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
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

export default function FAQ() {
  const [openId, setOpenId] = useState(null);

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="px-6 py-15 text-[#1B2027]">
      <div className="mx-auto max-w-4xl">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1B2027]">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-base text-[#1B2027]/70">
            Everything you need to know about setting up your store with ShopOS.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#1F3A5F]/30 shadow-md'
                    : 'bg-white/70 border-[#DEDAD1] hover:bg-white hover:border-[#1B2027]/30'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-sans text-base sm:text-lg font-bold text-[#1B2027] pr-4">
                    {faq.question}
                  </span>
                  <span
                    className={`flex h-8 w-8 flex-none items-center justify-center rounded-full transition-transform duration-300 ${
                      isOpen ? 'bg-[#1F3A5F] text-white rotate-180' : 'bg-[#F7F6F3] text-[#1B2027]/70'
                    }`}
                  >
                    <ChevronIcon className="h-4 w-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base leading-relaxed text-[#1B2027]/75 border-t border-[#DEDAD1]/40">
                    <p className="mt-2">{faq.answer}</p>

                    {faq.listItems && (
                      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {faq.listItems.map((item) => (
                          <li key={item} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#1B2027]/85">
                            <CheckIcon className="h-4 w-4 flex-none text-[#C6862E]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {faq.footnote && (
                      <p className="mt-4 text-xs font-semibold text-[#1F3A5F]">
                        {faq.footnote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}