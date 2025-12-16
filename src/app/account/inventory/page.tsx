'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { useToastContext } from '@/contexts/ToastContext';
import { productsApi, Product } from '@/lib/api/products';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import { EditIcon, DeleteIcon } from '@/components/ui/icons';
import styles from './inventory.module.css';

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const { showToast } = useToastContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; productId: string | null }>({ isOpen: false, productId: null });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Check if user is admin
    const userRole = (session?.user as any)?.role;
    if (status === 'authenticated' && userRole !== 'admin') {
      router.push('/account');
      return;
    }
  }, [status, session, router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll({ page, limit: 20, active: undefined });
      // Backend returns { data: [...], meta: {...} }
      setProducts(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && (session.user as any)?.role === 'admin') {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, page]);

  useEffect(() => {
    // Check for toast message from sessionStorage after redirect
    const toastMessage = sessionStorage.getItem('toastMessage');
    const toastType = sessionStorage.getItem('toastType');
    
    if (toastMessage && toastType) {
      showToast(toastMessage, toastType as 'success' | 'error' | 'info' | 'warning');
      // Clear the stored toast
      sessionStorage.removeItem('toastMessage');
      sessionStorage.removeItem('toastType');
    }
  }, [showToast]);

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const accessToken = (session as any)?.accessToken;
      if (!accessToken) {
        console.error('No access token available');
        return;
      }

      await productsApi.updateStock(productId, newStock, accessToken);
      showToast(t.inventory.messages.stockUpdateSuccess, 'success');
      await loadProducts();
    } catch (err) {
      console.error('Error updating stock:', err);
      showToast(t.inventory.messages.stockUpdateError, 'error');
    }
  };

  const handleDeleteClick = (productId: string) => {
    setDeleteDialog({ isOpen: true, productId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.productId) return;

    try {
      const accessToken = (session as any)?.accessToken;
      if (!accessToken) {
        showToast(t.inventory.messages.noSession, 'error');
        setDeleteDialog({ isOpen: false, productId: null });
        return;
      }

      await productsApi.delete(deleteDialog.productId, accessToken);
      setDeleteDialog({ isOpen: false, productId: null });
      showToast(t.inventory.messages.deleteSuccess, 'success');
      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast(t.inventory.messages.deleteError, 'error');
      setDeleteDialog({ isOpen: false, productId: null });
    }
  };

  if (status === 'loading' || !session) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{t.common.loading}</div>
      </div>
    );
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Button 
              variant="ghost"
              size="small"
              onClick={() => router.push('/account')}
            >
              ← {t.account.backToProfile || 'Volver al Perfil'}
            </Button>
            <h1 className={styles.title}>{t.inventory.title}</h1>
          </div>
          <Button 
            variant="primary"
            size="medium"
            onClick={() => router.push('/account/inventory/new')}
          >
            + {t.inventory.addProduct}
          </Button>
        </div>

        {loading ? (
          <div className={styles.loading}>{t.common.loading}</div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t.inventory.table.sku}</th>
                    <th>{t.inventory.table.product}</th>
                    <th>{t.inventory.table.price}</th>
                    <th>{t.inventory.table.stock}</th>
                    <th>{t.inventory.table.status}</th>
                    <th>{t.inventory.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className={styles.sku}>{product.sku}</td>
                      <td className={styles.productName}>
                        <div className={styles.productInfo}>
                          {product.images && product.images.length > 0 && (
                            <img 
                              src={product.images[0].url} 
                              alt={product.name}
                              className={styles.thumbnail}
                            />
                          )}
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td className={styles.price}>
                        ${product.price.toLocaleString('es-CO')}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          defaultValue={product.stockQuantity}
                          className={styles.stockInput}
                          onBlur={(e) => {
                            const newValue = parseInt(e.target.value);
                            if (newValue !== product.stockQuantity) {
                              handleUpdateStock(product.id, newValue);
                            }
                          }}
                        />
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[product.status]}`}>
                          {product.status === 'active' ? t.inventory.status.active : 
                           product.status === 'draft' ? t.inventory.status.draft : t.inventory.status.archived}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => router.push(`/account/inventory/edit/${product.id}`)}
                          title={t.inventory.actions.editTooltip}
                        >
                          <EditIcon size={18} />
                        </Button>
                        <Button 
                          variant="danger"
                          size="icon"
                          onClick={() => handleDeleteClick(product.id)}
                          title={t.inventory.actions.deleteTooltip}
                        >
                          <DeleteIcon size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="ghost"
                  size="medium"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← {t.inventory.pagination.previous}
                </Button>
                <span className={styles.pageInfo}>
                  {t.inventory.pagination.page.replace('{page}', page.toString()).replace('{total}', totalPages.toString())}
                </span>
                <Button
                  variant="ghost"
                  size="medium"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  {t.inventory.pagination.next} →
                </Button>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          message={t.inventory.messages.deleteConfirm}
          confirmText={t.common.delete}
          cancelText={t.common.cancel}
          type="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialog({ isOpen: false, productId: null })}
        />
      </div>
    </div>
  );
}
