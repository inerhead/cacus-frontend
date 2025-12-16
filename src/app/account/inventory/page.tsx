'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { productsApi, Product } from '@/lib/api/products';
import styles from './inventory.module.css';

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  useEffect(() => {
    if (session && (session.user as any)?.role === 'admin') {
      loadProducts();
    }
  }, [session, page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll({ page, limit: 20, active: undefined });
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const accessToken = (session as any)?.accessToken;
      if (!accessToken) return;

      // TODO: Implement update stock API call
      console.log('Update stock:', productId, newStock);
      await loadProducts();
    } catch (err) {
      console.error('Error updating stock:', err);
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
          <h1 className={styles.title}>{t.inventory.title}</h1>
          <button 
            className={styles.addButton}
            onClick={() => router.push('/account/inventory/new')}
          >
            + {t.inventory.addProduct}
          </button>
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
                        <button
                          className={styles.editButton}
                          onClick={() => router.push(`/account/inventory/edit/${product.id}`)}
                        >
                          ✏️
                        </button>
                        <button className={styles.deleteButton}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className={styles.paginationButton}
                >
                  ← {t.inventory.pagination.previous}
                </button>
                <span className={styles.pageInfo}>
                  {t.inventory.pagination.page.replace('{page}', page.toString()).replace('{total}', totalPages.toString())}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className={styles.paginationButton}
                >
                  {t.inventory.pagination.next} →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
