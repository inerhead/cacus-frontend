'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { addressesApi, Address, CreateAddressData, UpdateAddressData } from '@/lib/api/addresses';
import AddressForm from '@/components/addresses/AddressForm';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ToastContainer from '@/components/ui/ToastContainer';
import { useToast } from '@/hooks/useToast';
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
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; addressId: string | null }>({
    isOpen: false,
    addressId: null,
  });
  const { toasts, showToast, removeToast } = useToast();

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

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ isOpen: true, addressId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.addressId) return;

    try {
      const accessToken = (session as any)?.accessToken;
      await addressesApi.delete(deleteDialog.addressId, accessToken);
      setDeleteDialog({ isOpen: false, addressId: null });
      showToast(
        t.account.addresses.deleteSuccess || 'Dirección eliminada exitosamente',
        'success'
      );
      await loadAddresses();
    } catch (err: any) {
      setDeleteDialog({ isOpen: false, addressId: null });
      showToast(
        err.message || t.account.addresses.deleteError,
        'error'
      );
      console.error('Error deleting address:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const accessToken = (session as any)?.accessToken;
      await addressesApi.setDefault(id, accessToken);
      showToast(
        t.account.addresses.setDefaultSuccess || 'Dirección establecida como predeterminada',
        'success'
      );
      await loadAddresses();
    } catch (err: any) {
      showToast(
        err.message || t.account.addresses.error,
        'error'
      );
      console.error('Error setting default address:', err);
    }
  };

  const handleSubmit = async (data: CreateAddressData | UpdateAddressData) => {
    try {
      const accessToken = (session as any)?.accessToken;
      if (editingAddress) {
        await addressesApi.update(editingAddress.id, data, accessToken);
        showToast(
          t.account.addresses.updateSuccess || 'Dirección actualizada exitosamente',
          'success'
        );
      } else {
        await addressesApi.create(data, accessToken);
        showToast(
          t.account.addresses.createSuccess || 'Dirección creada exitosamente',
          'success'
        );
      }
      setShowForm(false);
      setEditingAddress(undefined);
      await loadAddresses();
    } catch (err: any) {
      const errorMessage = editingAddress
        ? t.account.addresses.updateError
        : t.account.addresses.createError;
      showToast(
        err.message || errorMessage,
        'error'
      );
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
          <Button 
            variant="ghost"
            size="small"
            onClick={() => router.push('/account')}
          >
            {t.account.addresses.backToAccount}
          </Button>
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
                  <Button 
                    variant="primary" 
                    size="medium" 
                    onClick={handleAddNew}
                  >
                    + {t.account.addresses.addNew}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.section}>
                  <div className={styles.addressesHeader}>
                    <h2 className={styles.addressesTitle}>
                      {t.account.addresses.title} ({addresses.length})
                    </h2>
                    <Button 
                      variant="primary" 
                      size="medium" 
                      onClick={handleAddNew}
                    >
                      + {t.account.addresses.addNew}
                    </Button>
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
                            onClick={() => handleDeleteClick(address.id)}
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

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          message={t.account.addresses.deleteConfirm}
          confirmText={t.common.delete}
          cancelText={t.common.cancel}
          type="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialog({ isOpen: false, addressId: null })}
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
}
