'use client';

import Link from 'next/link';
import { Search, User, ShoppingBag, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navigationItems = [
  { label: 'TEMAS', href: '/temas', hasDropdown: true },
  { label: 'INTERÉS', href: '/interes', hasDropdown: true },
  // { label: 'EXCLUSIVOS', href: '/exclusivos', hasDropdown: true },
  { label: 'NUEVOS', href: '/nuevos', hasDropdown: true },
  { label: 'ADULTOS', href: '/adultos', hasDropdown: true },
  { label: 'REGALOS', href: '/regalos', hasDropdown: true },
  { label: 'OFERTAS', href: '/ofertas', hasDropdown: false },
  // { label: 'GALERIA DE INSPIRACIÓN', href: '/galeria', hasDropdown: true },
  { label: 'COMBOS', href: '/combos', hasDropdown: false },
  // { label: 'PROGRAMA ELITE', href: '/programa-elite', hasDropdown: true },
  // { label: 'NOTICIAS', href: '/noticias', hasDropdown: false },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="w-full">
      {/* Main Header - Yellow */}
      <div className="bg-lego-yellow w-full">
        <div className="container mx-auto px-4">
          {/* Top Row: Logo, Navigation, User Icons */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="bg-lego-red text-white px-4 py-2 font-bold text-2xl tracking-tight">
                CACUS
              </div>
              <span className="ml-2 text-black font-bold text-xl">GIFT</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-4 flex-wrap justify-center">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-black font-semibold text-sm hover:text-lego-red transition-colors flex items-center gap-1"
                >
                  {item.label}
                  {item.hasDropdown && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Link>
              ))}
            </nav>

            {/* User Icons */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-black hover:text-lego-red transition-colors"
                aria-label="Usuario"
              >
                <User className="w-6 h-6" />
              </Link>
              <Link
                href="/cart"
                className="text-black hover:text-lego-red transition-colors relative"
                aria-label="Carrito"
              >
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-lego-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  0
                </span>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="pb-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-gray-300 rounded-none py-3 pl-12 pr-4 text-black placeholder-gray-400 focus:outline-none focus:border-lego-red focus:ring-2 focus:ring-lego-red"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-lego-yellow border-t border-gray-300">
        <div className="container mx-auto px-4 py-2">
          <nav className="flex items-center gap-2 overflow-x-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-black font-semibold text-xs whitespace-nowrap hover:text-lego-red transition-colors flex items-center gap-1"
              >
                {item.label}
                {item.hasDropdown && (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

