'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, User, ShoppingBag, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/contexts/LanguageContext';
import styles from './Header.module.css';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session } = useSession();
  const t = useTranslation();

  const navigationItems = [
    { label: t.navigation.themes, href: '/temas', hasDropdown: true },
    { label: t.navigation.interest, href: '/interes', hasDropdown: true },
    { label: t.navigation.new, href: '/nuevos', hasDropdown: true },
    { label: t.navigation.adults, href: '/adultos', hasDropdown: true },
    { label: t.navigation.gifts, href: '/regalos', hasDropdown: true },
    { label: t.navigation.offers, href: '/ofertas', hasDropdown: false },
    { label: t.navigation.combos, href: '/combos', hasDropdown: false },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.headerMain}>
        <div className={styles.headerContainer}>
          <div className={styles.topRow}>
            <div className={styles.logoArea}>
              <Link href="/" className={styles.logo} aria-label="CACUS Gift home">
                <Image
                  src="/assets/logo-cacus.svg"
                  alt="CACUS Gift logo"
                  width={220}
                  height={120}
                  priority
                  className={styles.logoImage}
                />
              </Link>
            </div>

            <div className={styles.navigationArea}>
              <nav className={styles.navigation}>
                {navigationItems.map((item) => (
                  <Link key={item.label} href={item.href} className={styles.navLink}>
                    {item.label}
                    {item.hasDropdown && <ChevronDown size={14} />}
                  </Link>
                ))}
              </nav>
            </div>

            <div className={styles.userIconsArea}>
              <div className={styles.userIcons}>
                <div className={styles.userSection}>
                  <Link
                    href={session ? "/account" : "/login"}
                    className={`${styles.iconLink} ${session ? styles.iconLinkLoggedIn : ''}`}
                    aria-label={session ? t.header.myAccount : t.header.login}
                  >
                    {session?.user?.avatarUrl || session?.user?.image ? (
                      <Image
                        src={session.user.avatarUrl || session.user.image || ''}
                        alt={session.user.name || 'User avatar'}
                        width={28}
                        height={28}
                        className={styles.userAvatar}
                      />
                    ) : (
                      <User size={22} />
                    )}
                  </Link>
                  {session?.user?.firstName && (
                    <span className={styles.userFirstName} title={session.user.email}>
                      {session.user.firstName}
                    </span>
                  )}
                </div>
                <Link href="/cart" className={styles.iconLink} aria-label={t.header.cart}>
                  <ShoppingBag size={22} />
                  <span className={styles.cartBadge}>0</span>
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.searchWrapper}>
            <div className={styles.searchInputWrapper}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder={t.header.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mobileNav}>
        <div className={styles.mobileNavContainer}>
          <nav className={styles.mobileNavList}>
            {navigationItems.map((item) => (
              <Link key={item.label} href={item.href} className={styles.mobileNavLink}>
                {item.label}
                {item.hasDropdown && <ChevronDown size={12} />}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
