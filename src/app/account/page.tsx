'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage, useTranslation } from '@/contexts/LanguageContext';
import styles from './account.module.css';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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
          <button onClick={handleSignOut} className={styles.signOutButton}>
            {t.account.signOut}
          </button>
        </div>

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

        {/* Default Address Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t.account.defaultAddress}</h3>
          <div className={styles.addressInfo}>
            <p className={styles.addressName}>{session.user?.name || t.account.defaultUser}</p>
            <Link href="/account/addresses" className={styles.link}>
              {t.account.viewAddresses.replace('{count}', '0')}
            </Link>
          </div>
          <p className={styles.noData}>{t.account.noAddresses}</p>
        </div>

        {/* Order History Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t.account.orderHistory}</h3>
          <div className={styles.orderHistory}>
            <p className={styles.noData}>{t.account.noOrders}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
