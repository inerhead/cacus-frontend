'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { useToastContext } from '@/contexts/ToastContext';
import { productsApi, Product } from '@/lib/api/products';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import ImagePreviewModal from '@/components/ui/ImagePreviewModal';
import { EditIcon, DeleteIcon, UploadIcon } from '@/components/ui/icons';
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; productId: string | null }>({ isOpen: false, productId: null });
  const [importing, setImporting] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ isOpen: boolean; url: string; alt: string }>({ isOpen: false, url: '', alt: '' });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Check if user is admin
    const userRole = (session?.user as any)?.role;
    if (status === 'authenticated' && userRole !== 'ADMIN') {
      router.push('/account');
      return;
    }
  }, [status, session, router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const queryParams: any = { page, limit: 20 };
      
      // Apply status filter
      if (statusFilter === 'active') {
        queryParams.status = 'active';
      } else if (statusFilter === 'inactive') {
        queryParams.status = 'inactive';
      }
      // Don't add 'status' param when statusFilter === 'all'
      
      const data = await productsApi.getAll(queryParams);
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
    if (session && (session.user as any)?.role === 'ADMIN') {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, page, statusFilter]);

  // Reload products when page receives focus (returning from edit page)
  useEffect(() => {
    const handleFocus = () => {
      if (session && (session.user as any)?.role === 'ADMIN') {
        loadProducts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session]);

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      showToast(t.inventory.messages.invalidFileType || 'Por favor selecciona un archivo Excel (.xlsx o .xls)', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(t.inventory.messages.fileTooLarge || 'El archivo es demasiado grande (máximo 5MB)', 'error');
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', file);

      const accessToken = (session as any)?.accessToken;
      if (!accessToken) {
        showToast(t.inventory.messages.noSession, 'error');
        return;
      }

      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al importar productos');
      }

      const result = await response.json();
      showToast(
        t.inventory.messages.importSuccess?.replace('{count}', result.imported || 0) || 
        `${result.imported || 0} productos importados exitosamente`,
        'success'
      );
      await loadProducts();
    } catch (err: any) {
      console.error('Error importing products:', err);
      showToast(err.message || t.inventory.messages.importError || 'Error al importar productos', 'error');
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    // Create template data with ImageURLs column
    const template = [
      ['SKU*', 'Name*', 'Price*', 'Stock*', 'ShortDescription', 'LongDescription', 'CompareAtPrice', 'Brand', 'Material', 'Status', 'Featured', 'New', 'AllowBackorder', 'ImageURLs'],
      ['EXAMPLE-001', 'Producto de Ejemplo', '99900', '10', 'Descripción corta', 'Descripción larga del producto', '129900', 'Marca Ejemplo', 'Madera', 'active', 'true', 'false', 'false', 'https://example.com/image1.jpg,https://example.com/image2.jpg'],
      ['EXAMPLE-002', 'Otro Producto', '149900', '5', 'Otra descripción', 'Descripción detallada', '', 'Otra Marca', 'Plástico', 'draft', 'false', 'true', 'false', 'https://example.com/image3.jpg'],
    ];

    // Convert to CSV
    const csv = template.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_productos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === 'loading' || !session) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{t.common.loading}</div>
      </div>
    );
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== 'ADMIN') {
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
          <div className={styles.headerRight}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>{t.inventory.filterByStatus || 'Estado:'}</label>
              <select 
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">{t.inventory.statusFilter?.all || 'Todos'}</option>
                <option value="active">{t.inventory.statusFilter?.active || 'Activos'}</option>
                <option value="inactive">{t.inventory.statusFilter?.inactive || 'Inactivos'}</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className={styles.actionsBar}>
          <div className={styles.headerActions}>
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleDownloadTemplate}
              title={t.inventory.downloadTemplate || 'Descargar Plantilla'}
            >
              📥
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleImportClick}
              loading={importing}
              disabled={importing}
              title={t.inventory.importExcel || 'Importar Excel'}
            >
              <UploadIcon size={20} />
            </Button>
            <Button 
              variant="primary"
              size="medium"
              onClick={() => router.push('/account/inventory/new')}
            >
              + {t.inventory.addProduct}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
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
                          {product.images && product.images.length > 0 && (() => {
                            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                            return (
                              <img 
                                src={primaryImage.url} 
                                alt={product.name}
                                className={styles.thumbnail}
                                onClick={() => setImagePreview({ isOpen: true, url: primaryImage.url, alt: product.name })}
                                style={{ cursor: 'pointer' }}
                              />
                            );
                          })()}
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

        {/* Image Preview Modal */}
        <ImagePreviewModal
          isOpen={imagePreview.isOpen}
          imageUrl={imagePreview.url}
          imageAlt={imagePreview.alt}
          onClose={() => setImagePreview({ isOpen: false, url: '', alt: '' })}
        />
      </div>
    </div>
  );
}
