"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import {
  HiHome,
  HiShoppingBag,
  HiArrowRightOnRectangle,
  HiBars3,
} from 'react-icons/hi2';
import { authClient } from '@/lib/auth-client';
import { FaShop } from 'react-icons/fa6';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const router = useRouter();
  const dropdownRef = useRef(null);
  const moreMenuRef = useRef(null);

  const { data: session } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pathname = usePathname();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        }
      }
    });
  };

  const isActive = (path) => pathname === path;

  const getLinkClasses = (path) =>
    isActive(path)
      ? "text-emerald-600 font-bold transition-colors duration-200"
      : "hover:text-emerald-500 font-medium transition-colors duration-200 text-gray-700";

  return (
    <nav className="shadow-md sticky top-0 z-50 bg-[#F7F6F3] ">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-19">

          {/* New ShopOS Logo */}
         <Link href="/" className="shrink-0 flex items-center gap-2 cursor-pointer">
            <FaShop  className="h-8 w-8 text-[#3f284d]" />
            <span className="text-xl font-bold tracking-tight text-[#244f34]">
              Shop<span className="text-[#2f598c]">OS</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center lg:space-x-4 xl:space-x-8">
            <Link href="/" className={getLinkClasses("/")}>
              Home
            </Link>

            <Link href="/dashboard/seller/create-shop" className={getLinkClasses("/shop")}>
              Back to my shop
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-emerald-700 transition-colors duration-200"
            >
              <HiArrowRightOnRectangle className="h-4.5 w-4.5" />
              Logout
            </button>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex items-center xl:hidden relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setShowMoreMenu((prev) => !prev)}
              aria-label="Toggle menu"
              className="p-2 text-gray-700 hover:text-emerald-600 focus:outline-none"
            >
              <HiBars3 className="h-6 w-6" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50 animate-fadeIn">
                <Link
                  href="/"
                  className={`block px-4 py-2 text-sm ${isActive('/') ? 'text-emerald-600 font-semibold' : 'text-gray-700'} hover:bg-emerald-50 hover:text-emerald-600`}
                  onClick={() => setShowMoreMenu(false)}
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  className={`block px-4 py-2 text-sm ${isActive('/shop') ? 'text-emerald-600 font-semibold' : 'text-gray-700'} hover:bg-emerald-50 hover:text-emerald-600`}
                  onClick={() => setShowMoreMenu(false)}
                >
                  Back to my shop
                </Link>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-emerald-50"
                >
                  <HiArrowRightOnRectangle className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <div className="xl:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-3">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 py-2"
          >
            <span className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors duration-200 ${isActive('/') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500'}`}>
              <HiHome className="h-5 w-5" />
            </span>
            <span className={`text-[11px] ${isActive('/') ? 'text-emerald-600 font-semibold' : 'text-gray-500 font-medium'}`}>
              Home
            </span>
          </Link>

          <Link
            href="/shop"
            className="flex flex-col items-center justify-center gap-1 py-2"
          >
            <span className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors duration-200 ${isActive('/shop') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500'}`}>
              <HiShoppingBag className="h-5 w-5" />
            </span>
            <span className={`text-[11px] ${isActive('/shop') ? 'text-emerald-600 font-semibold' : 'text-gray-500 font-medium'}`}>
              Shop
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 py-2"
          >
            <span className="flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
              <HiArrowRightOnRectangle className="h-5 w-5" />
            </span>
            <span className="text-[11px] text-red-700 font-medium">
              Logout
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;