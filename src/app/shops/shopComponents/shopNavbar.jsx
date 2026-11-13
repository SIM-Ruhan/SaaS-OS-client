'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FiSearch, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useCart } from './cartContext';

export default function Navbar({ shopName, logoUrl, shopSlug, user = null }) {
  // user = null → not logged in
  // user = { name, avatarUrl, role } → logged in
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { count: cartCount } = useCart();

  const navLinks = [
    { label: 'Home', href: `/shops/${shopSlug}` },
    { label: 'All products', href: `/shops/${shopSlug}/products` },
    { label: 'Categories', href: `/shops/${shopSlug}#categories` },
    { label: 'My profile', href: `/shops/${shopSlug}/profile` },
  ];

  const isLoggedIn = !!user;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E2DA] shadow-sm">
      <div className="max-w-[95%] mx-auto px-2 sm:px-0">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand */}
          <Link href={`/shops/${shopSlug}`} className="flex shrink-0 items-center gap-2">
            {logoUrl ? (
              <Image
                unoptimized
                width={36}
                height={36}
                src={logoUrl}
                alt={shopName}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover"
              />
            ) : null}
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#1B2027] truncate max-w-[120px] xs:max-w-[160px] sm:max-w-xs">
              {shopName}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#1B2027]/70 hover:text-green-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              className="p-2 text-[#1B2027]/60 hover:text-green-700 transition-colors"
            >
              <FiSearch className="w-5 h-5" />
            </button>
             {/* Cart */}
            <Link
              href={`/shops/${shopSlug}/cart`}
              aria-label="Cart"
              className="relative p-2 text-[#1B2027]/60 hover:text-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-green-700 rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth / Account area */}
            {isLoggedIn ? (
              <>
                {/* Dashboard link (especially useful for sellers) */}
                <Link
                  href={`/shops/${shopSlug}/dashboard/user`}
                  className="hidden sm:inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-[#1B2027]/70 hover:text-green-700 transition-colors"
                >
                  Dashboard
                </Link>

                {/* Profile Avatar */}
                <Link
                  href={`/shops/${shopSlug}/account`}
                  aria-label="Account"
                  className="relative p-1.5"
                >
                  {user.avatarUrl ? (
                    <Image
                      unoptimized
                      src={user.avatarUrl}
                      alt={user.name || 'Profile'}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-[#E5E2DA]"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-white text-sm font-semibold">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/shops/${shopSlug}/login`}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-[#1B2027]/70 hover:text-green-700 transition-colors"
                >
                  <FiLogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href={`/shops/${shopSlug}/registration`}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800 transition-colors"
                >
                  <FiUserPlus className="w-4 h-4" />
                  Register
                </Link>
              </>
            )}

           

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              className="p-2 text-[#1B2027]/60 hover:text-green-700 focus:outline-none md:hidden"
            >
              {isMobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-[#E5E2DA] bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className="block px-3 py-2.5 rounded-md text-base font-medium text-[#1B2027]/80 hover:bg-[#F7F6F3] hover:text-green-700"
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-[#E5E2DA] my-2 pt-2 space-y-1">
            {isLoggedIn ? (
              <>
                <Link
                  href={`/shops/${shopSlug}/dashboard`}
                  onClick={() => setIsMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-base font-medium text-[#1B2027]/80 hover:bg-[#F7F6F3] hover:text-green-700"
                >
                  Dashboard
                </Link>
                <Link
                  href={`/shops/${shopSlug}/account`}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-[#1B2027]/80 hover:bg-[#F7F6F3] hover:text-green-700"
                >
                  {user.avatarUrl ? (
                    <Image
                      unoptimized
                      src={user.avatarUrl}
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-700 text-white text-xs font-semibold">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/shops/${shopSlug}/login`}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-base font-medium text-[#1B2027]/80 hover:bg-[#F7F6F3] hover:text-green-700"
                >
                  <FiLogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href={`/shops/${shopSlug}/register`}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-base font-medium text-green-700 hover:bg-green-50"
                >
                  <FiUserPlus className="w-4 h-4" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}