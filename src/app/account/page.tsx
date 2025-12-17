'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage, useTranslation } from '@/contexts/LanguageContext';
import { addressesApi, Address } from '@/lib/api/addresses';
import { productsApi } from '@/lib/api/products';
import Button from '@/components/ui/Button';
import CurrencySelector from '@/components/layout/CurrencySelector';
import styles from './account.module.css';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      console.log('[Account Page] Session user role:', (session.user as any)?.role);
      console.log('[Account Page] Full session:', session);
      loadAddresses();
      // Load product count if user is admin
      if ((session.user as any)?.role === 'ADMIN') {
        loadProductCount();
      }
    }
  }, [session]);

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const accessToken = (session as any)?.accessToken;
      const data = await addressesApi.getAll(accessToken);
      setAddresses(data);
    } catch (err: any) {
      console.error('Error loading addresses:', err);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadProductCount = async () => {
    try {
      const data = await productsApi.getAll({ page: 1, limit: 1 });
      setProductCount(data.meta?.total || 0);
    } catch (err: any) {
      console.error('Error loading product count:', err);
      setProductCount(0);
    }
  };

  const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleLanguageChange = (newLanguage: 'es' | 'en') => {
    setLanguage(newLanguage);
  };

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{t.common.loading}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header Section */}
        <div className={styles.header}>
          <h1 className={styles.title}>{t.account.title}</h1>
          <Button 
            variant="danger" 
            size="medium" 
            onClick={handleSignOut}
          >
            {t.account.signOut}
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className={styles.columnsContainer}>
          {/* Left Column - Profile & Language */}
          <div className={styles.column}>
            {/* User Info Section */}
            <div className={styles.section}>
              <div className={styles.userInfo}>
                {(session.user?.avatarUrl || session.user?.image) && (
                  <div className={styles.avatarContainer}>
                    <Image
                      src={session.user.avatarUrl || session.user.image || ''}
                      alt={session.user.name || 'User avatar'}
                      width={80}
                      height={80}
                      className={styles.userAvatar}
                    />
                  </div>
                )}
                <h2 className={styles.userName}>{session.user?.name || t.account.defaultUser}</h2>
                <p className={styles.userEmail}>{session.user?.email}</p>
              </div>
            </div>

            {/* Language Selector */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t.account.language}</h3>
              <div className={styles.languageSelector}>
                <button
                  className={`${styles.languageButton} ${language === 'es' ? styles.active : ''}`}
                  onClick={() => handleLanguageChange('es')}
                >
                  🇪🇸 Español
                </button>
                <button
                  className={`${styles.languageButton} ${language === 'en' ? styles.active : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  🇺🇸 English
                </button>
              </div>
            </div>

            {/* Currency Selector */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>💰 {t.account.currencyPreference}</h3>
              <div className={styles.currencySelector}>
                <p className={styles.sectionDescription}>
                  {t.account.currencyDescription}
                </p>
                <CurrencySelector />
              </div>
            </div>
          </div>

          {/* Right Column - Addresses & Orders */}
          <div className={styles.column}>
            {/* Admin Inventory Section - Only visible for admin role */}
            {(session.user as any)?.role === 'ADMIN' && (
              <>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>⚙️ {t.account.admin.title}</h3>
                  <div className={styles.addressInfo}>
                    <div className={styles.addressDetails}>
                      <p className={styles.addressName}>{t.account.admin.inventory}</p>
                      <p className={styles.addressText}>{t.account.admin.inventoryDescription}</p>
                    </div>
                    <Link href="/account/inventory" className={styles.link}>
                      {t.account.admin.manageInventory || 'gestionar inventario'} ({productCount})
                    </Link>
                  </div>
                  <div className={styles.addressInfo} style={{ marginTop: '1rem' }}>
                    <div className={styles.addressDetails}>
                      <p className={styles.addressName}>{t.account.admin.content.title}</p>
                      <p className={styles.addressText}>{t.account.admin.content.description}</p>
                    </div>
                    <Link href="/admin/content" className={styles.link}>
                      {t.account.admin.editContent || 'editar contenido'} →
                    </Link>
                  </div>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>💱 {t.account.currency.title}</h3>
                  <div className={styles.addressInfo}>
                    <div className={styles.addressDetails}>
                      <p className={styles.addressName}>{t.account.currency.exchangeRate}</p>
                      <p className={styles.addressText}>{t.account.currency.exchangeRateDescription}</p>
                    </div>
                    <Link href="/account/settings" className={styles.link}>
                      {t.account.currency.configure}
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* Default Address Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📍 {t.account.defaultAddress}</h3>
              {loadingAddresses ? (
                <p className={styles.noData}>{t.common.loading}</p>
              ) : addresses.length > 0 && defaultAddress ? (
                <>
                  <div className={styles.addressInfo}>
                    <div className={styles.addressDetails}>
                      {defaultAddress.isDefault && (
                        <div className={styles.defaultBadge}>
                          {t.account.addresses.default}
                        </div>
                      )}
                      {defaultAddress.fullName && (
                        <p className={styles.addressName}>{defaultAddress.fullName}</p>
                      )}
                      <p className={styles.addressText}>
                        {defaultAddress.addressLine1}
                        {defaultAddress.addressLine2 && `, ${defaultAddress.addressLine2}`}
                      </p>
                      <p className={styles.addressText}>
                        {defaultAddress.city}, {defaultAddress.state}
                        {defaultAddress.postalCode && ` ${defaultAddress.postalCode}`}
                      </p>
                      {defaultAddress.phone && (
                        <p className={styles.addressText}>{defaultAddress.phone}</p>
                      )}
                    </div>
                    <Link href="/account/addresses" className={styles.link}>
                      {t.account.viewAddresses.replace('{count}', addresses.length.toString())}
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.addressInfo}>
                    <p className={styles.addressName}>{session.user?.name || t.account.defaultUser}</p>
                    <Link href="/account/addresses" className={styles.link}>
                      {t.account.viewAddresses.replace('{count}', addresses.length.toString())}
                    </Link>
                  </div>
                  <p className={styles.noData}>{t.account.noAddresses}</p>
                </>
              )}
            </div>

            {/* Order History Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📋 {t.account.orderHistory}</h3>
              <div className={styles.addressInfo}>
                <p className={styles.addressName}>{session.user?.name || t.account.defaultUser}</p>
                <Link href="/account/orders" className={styles.link}>
                  {t.account.viewOrders.replace('{count}', '0')}
                </Link>
              </div>
              <p className={styles.noData}>{t.account.noOrders}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
