'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import styles from './addresses.module.css';

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslation();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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
        <div className={styles.header}>
          <Link href="/account" className={styles.backLink}>
            {t.account.addresses.backToAccount}
          </Link>
          <h1 className={styles.title}>{t.account.addresses.title}</h1>
        </div>

        <div className={styles.section}>
          <div className={styles.emptyState}>
            <p className={styles.emptyMessage}>
              {t.account.addresses.noAddresses}
            </p>
            <button className={styles.addButton}>
              {t.account.addresses.addNew}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
