'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PackagePlus,
  Package,
  Users,
  ShoppingCart,
  FileText,
  CreditCard,
  Truck,
  UserCog,
  Receipt,
  Settings,
  Store,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Main',
    items: [
      { label: 'Overview', href: '/dashboard/seller', icon: LayoutDashboard },
      { label: 'Create shop', href: '/dashboard/seller/create-shop', icon: Store },
    ],
  },
  {
    label: 'Catalog',
    items: [{ label: 'Products and CSV', href: '/dashboard/products', icon: Package }],
  },
  { label: 'Sales', items: [{ label: 'Orders', href: '/dashboard/orders', icon: ShoppingCart }] },
  {
    label: 'Configuration',
    items: [
      { label: 'Payments', href: '/dashboard/settings/payments', icon: CreditCard },
      { label: 'Couriers', href: '/dashboard/settings/couriers', icon: Truck },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-none flex-col md:flex border-r border-[#E5E2DA] bg-white">
      {/* Store identity */}
      <div className="flex items-center gap-2.5 border-b border-[#E5E2DA] px-6 py-5">
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-gradient-to-b from-green-600 via-green-700 to-green-800 text-white">
          <Store className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#1B2027]">ShopOS</p>
          <p className="truncate text-xs text-[#1B2027]/50">Seller dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-[#1B2027]/40">
              {group.label}
            </p>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ' +
                        (isActive
                          ? 'bg-gradient-to-b from-green-600 via-green-700 to-green-800 font-medium text-white shadow-sm'
                          : 'text-[#1B2027]/70 hover:bg-[#F7F6F3] hover:text-[#1B2027]')
                      }
                    >
                      <Icon
                        className={
                          'h-4 w-4 flex-none ' + (isActive ? 'text-white' : 'text-[#1B2027]/50')
                        }
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
