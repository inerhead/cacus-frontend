'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import styles from './CartDrawer.module.css';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const t = useTranslation();
  const { formatPrice } = useCurrency();
  const { items: cartItems, totalItems, totalPrice, updateQuantity, removeItem } = useCart();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={styles.overlay}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {t.cart.title} ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Cerrar carrito"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className={styles.itemsContainer}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>{t.cart.empty}</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                {/* Product Image */}
                <div className={styles.itemImage}>
                  <Image
                    src={item.primaryImageUrl || '/assets/product-placeholder.svg'}
                    alt={item.name}
                    width={100}
                    height={100}
                    className={styles.productImage}
                    unoptimized
                  />
                </div>

                {/* Product Info */}
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  
                  {/* Quantity Controls */}
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={16} />
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      className={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Price & Delete */}
                <div className={styles.itemActions}>
                  <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                  <button
                    className={styles.deleteButton}
                    onClick={() => removeItem(item.id)}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.totalSection}>
            <span className={styles.totalLabel}>{t.cart.total}:</span>
            <span className={styles.totalAmount}>{formatPrice(totalPrice)}</span>
          </div>
          <button
            className={styles.checkoutButton}
            disabled={cartItems.length === 0}
            onClick={handleCheckout}
          >
            {t.cart.checkout}
          </button>
        </div>
      </div>
    </>
  );
}
