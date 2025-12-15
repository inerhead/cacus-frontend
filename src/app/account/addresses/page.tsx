'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { addressesApi, Address, CreateAddressData, UpdateAddressData } from '@/lib/api/addresses';
import AddressForm from '@/components/addresses/AddressForm';
import styles from './addresses.module.css';

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      loadAddresses();
    }
  }, [session]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = (session as any)?.accessToken;
      const data = await addressesApi.getAll(accessToken);
      setAddresses(data);
    } catch (err: any) {
      setError(err.message || t.account.addresses.error);
      console.error('Error loading addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAddress(undefined);
    setShowForm(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.account.addresses.deleteConfirm)) {
      return;
    }

    try {
      const accessToken = (session as any)?.accessToken;
      await addressesApi.delete(id, accessToken);
      await loadAddresses();
    } catch (err: any) {
      alert(err.message || t.account.addresses.deleteError);
      console.error('Error deleting address:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const accessToken = (session as any)?.accessToken;
      await addressesApi.setDefault(id, accessToken);
      await loadAddresses();
    } catch (err: any) {
      alert(err.message || t.account.addresses.error);
      console.error('Error setting default address:', err);
    }
  };

  const handleSubmit = async (data: CreateAddressData | UpdateAddressData) => {
    try {
      const accessToken = (session as any)?.accessToken;
      if (editingAddress) {
        await addressesApi.update(editingAddress.id, data, accessToken);
      } else {
        await addressesApi.create(data, accessToken);
      }
      setShowForm(false);
      setEditingAddress(undefined);
      await loadAddresses();
    } catch (err: any) {
      const errorMessage = editingAddress
        ? t.account.addresses.updateError
        : t.account.addresses.createError;
      alert(err.message || errorMessage);
      console.error('Error saving address:', err);
      throw err;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(undefined);
  };

  if (status === 'loading' || loading) {
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

        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        {showForm ? (
          <AddressForm
            address={editingAddress}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <>
            {addresses.length === 0 ? (
              <div className={styles.section}>
                <div className={styles.emptyState}>
                  <p className={styles.emptyMessage}>
                    {t.account.addresses.noAddresses}
                  </p>
                  <button className={styles.addButton} onClick={handleAddNew}>
                    {t.account.addresses.addNew}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.section}>
                  <div className={styles.addressesHeader}>
                    <h2 className={styles.addressesTitle}>
                      {t.account.addresses.title} ({addresses.length})
                    </h2>
                    <button className={styles.addButton} onClick={handleAddNew}>
                      {t.account.addresses.addNew}
                    </button>
                  </div>

                  <div className={styles.addressesList}>
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`${styles.addressCard} ${address.isDefault ? styles.addressCardDefault : ''}`}
                      >
                        {address.isDefault && (
                          <div className={styles.defaultBadge}>
                            {t.account.addresses.default}
                          </div>
                        )}
                        <div className={styles.addressContent}>
                          {address.fullName && (
                            <p className={styles.addressName}>{address.fullName}</p>
                          )}
                          <p className={styles.addressLine}>
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className={styles.addressLine}>
                            {address.city}, {address.state}
                            {address.postalCode && ` ${address.postalCode}`}
                          </p>
                          <p className={styles.addressLine}>{address.country}</p>
                          {address.phone && (
                            <p className={styles.addressPhone}>{address.phone}</p>
                          )}
                        </div>
                        <div className={styles.addressActions}>
                          {!address.isDefault && (
                            <button
                              className={styles.actionButton}
                              onClick={() => handleSetDefault(address.id)}
                            >
                              {t.account.addresses.setDefault}
                            </button>
                          )}
                          <button
                            className={styles.actionButton}
                            onClick={() => handleEdit(address)}
                          >
                            {t.account.addresses.edit}
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(address.id)}
                          >
                            {t.account.addresses.delete}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
