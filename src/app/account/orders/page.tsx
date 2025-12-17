'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApiClient, Order } from '@/lib/api/orders';
import { useTranslation } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import Button from '@/components/ui/Button';
import styles from './orders.module.css';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      loadOrders();
    }
  }, [status, page, router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApiClient.getUserOrders(page, 10);
      setOrders(data.orders);
      setTotalPages(data.meta.totalPages);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: '#FFA500',
      processing: '#0066CC',
      shipped: '#9B59B6',
      delivered: '#27AE60',
      cancelled: '#E74C3C',
    };
    return statusColors[status] || '#95A5A6';
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return statusLabels[status] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Fallido',
      refunded: 'Reembolsado',
    };
    return statusLabels[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>{t.common.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href="/account" className={styles.backButton}>
              ← {t.common.back || 'VOLVER AL PERFIL'}
            </Link>
            <h1 className={styles.title}>📋 {t.account.orderHistory}</h1>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h2 className={styles.emptyTitle}>{t.account.noOrders}</h2>
            <p className={styles.emptyText}>
              Aún no has realizado ningún pedido. ¡Explora nuestro catálogo y realiza tu primera compra!
            </p>
            <Link href="/">
              <Button variant="primary" size="large">
                {t.home.viewCatalog}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.ordersGrid}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  {/* Order Header */}
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderNumber}>
                        Pedido #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                    </div>
                    <div
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className={styles.orderItems}>
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className={styles.orderItem}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{item.productSnapshot.name}</span>
                          <span className={styles.itemQuantity}>Cantidad: {Number(item.quantity) || 0}</span>
                        </div>
                        <span className={styles.itemPrice}>{formatPrice(Number(item.unitPrice) || 0)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className={styles.moreItems}>
                        +{order.items.length - 3} productos más
                      </p>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className={styles.orderFooter}>
                    <div className={styles.orderTotal}>
                      <span className={styles.totalLabel}>Total:</span>
                      <span className={styles.totalAmount}>{formatPrice(Number(order.total))}</span>
                    </div>
                    <div className={styles.paymentStatus}>
                      <span className={styles.paymentLabel}>Pago:</span>
                      <span
                        className={styles.paymentBadge}
                        style={{
                          color: order.paymentStatus === 'completed' ? '#27AE60' : '#FFA500',
                        }}
                      >
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/account/orders/${order.id}`} className={styles.viewButton}>
                    Ver Detalles →
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="ghost"
                  size="medium"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Anterior
                </Button>
                <span className={styles.pageInfo}>
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="medium"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
