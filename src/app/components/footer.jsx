'use client';

import Link from "next/link";

function IconLink({ href, label, children }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1F3A5F]/15 text-[#1F3A5F]/70 transition-colors hover:border-[#1F3A5F]/40 hover:text-[#1F3A5F]"
    >
      {children}
    </Link>
  );
}

const linkColumns = [
  {
    heading: 'Product',
    links: ['Landing page builder', 'Payments & couriers', 'Analytics dashboard', 'AI add-ons', 'Pricing'],
  },
  {
    heading: 'For sellers',
    links: ['Bangladesh sellers', 'International sellers', 'Supply & demand intel', 'WhatsApp commerce'],
  },
  {
    heading: 'Company',
    links: ['About', 'Careers', 'Partners', 'Contact'],
  },
  {
    heading: 'Resources',
    links: ['Help center', 'API docs', 'Status', 'Community'],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#F7F6F3] py-10 text-[#1F3A5F]">
      <div className="mx-auto max-w-[95%]">
        {/* Top: wordmark + CTA */}
        <div className="border-b border-[#1F3A5F]/10 pb-5">
          <div>
            <span className="font-serif text-4xl">ShopOS</span>
            <p className="mt-3 text-[#1F3A5F]/70">
              The e-commerce platform built for dedicated sellers going global —
              storefronts, payments and couriers, all in one place.
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-10 py-14 sm:grid-cols-4">
          {linkColumns.map((col) => (
            <div key={col.heading}>
              <h4 className="font-sans text-sm font-semibold text-[#1F3A5F]">
                {col.heading}
              </h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#1F3A5F]/70 transition-colors hover:text-[#1F3A5F]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-6 border-t border-[#1F3A5F]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#1F3A5F]/60">
            © {new Date().getFullYear()} ShopOS. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-xs text-[#1F3A5F]/60">
              <a href="#" className="transition-colors hover:text-[#1F3A5F]">Privacy</a>
              <a href="#" className="transition-colors hover:text-[#1F3A5F]">Terms</a>
              <a href="#" className="transition-colors hover:text-[#1F3A5F]">Cookies</a>
            </div>

            <div className="flex gap-2">
              <IconLink href="#" label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M14 8.5h2V5.5h-2c-1.66 0-3 1.34-3 3v2H9v3h2v6h3v-6h2l.5-3H14v-1c0-.28.22-.5.5-.5z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconLink>
              <IconLink href="#" label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.3" />
                  <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.3" />
                  <circle cx="16.2" cy="7.8" r="0.8" fill="currentColor" />
                </svg>
              </IconLink>
              <IconLink href="#" label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.3" />
                  <line x1="8" y1="10.5" x2="8" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <circle cx="8" cy="7.7" r="0.9" fill="currentColor" />
                  <path d="M11.5 16v-3.2c0-1.2.8-1.8 1.8-1.8s1.7.6 1.7 1.8V16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </IconLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}