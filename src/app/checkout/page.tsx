'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import { useToastContext } from '@/contexts/ToastContext';
import { addressesApi, Address } from '@/lib/api/addresses';
import { ordersApiClient } from '@/lib/api/orders';
import Button from '@/components/ui/Button';
import { PSEPaymentForm, PSEPaymentData } from '@/components/payment';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const { formatPrice } = useCurrency();
  const { items, totalPrice, isLoading: cartLoading } = useCart();
  const { showToast } = useToastContext();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('PSE');
  const [psePaymentData, setPsePaymentData] = useState<PSEPaymentData>({ personType: 'natural', bankCode: '' });
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressSelector, setShowAddressSelector] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [status, router]);

  // Load addresses
  useEffect(() => {
    if (session) {
      loadAddresses();
    }
  }, [session]);

  // Select default address automatically
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const accessToken = (session as any)?.accessToken;
      const data = await addressesApi.getAll(accessToken);
      setAddresses(data);
    } catch (error) {
      console.error('Error loading addresses:', error);
      showToast(t.checkout.noAddress, 'error');
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Calculate totals
  const subtotal = totalPrice;
  const freeShippingThreshold = 150000;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 15000;
  const taxRate = 0.19;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || addresses.length === 0) {
      showToast(t.checkout.noAddress, 'error');
      router.push('/account/addresses?returnUrl=/checkout');
      return;
    }

    if (items.length === 0) {
      showToast(t.cart.empty, 'error');
      return;
    }

    // Validate PSE payment data if PSE is selected
    if (paymentMethod === 'PSE') {
      if (!psePaymentData.bankCode) {
        showToast('Por favor selecciona un banco', 'error');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const order = await ordersApiClient.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      showToast('¡Orden creada! Redirigiendo al pago...', 'success');
      
      // TODO: Redirect to PSE payment gateway
      // For now, redirect to order confirmation
      setTimeout(() => {
        router.push(`/account/orders/${order.id}`);
      }, 1500);

    } catch (error: any) {
      console.error('Error creating order:', error);
      showToast(error.response?.data?.message || 'Error al crear la orden', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === 'loading' || cartLoading || loadingAddresses) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{t.common.loading}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h2>{t.cart.empty}</h2>
          <Button variant="primary" onClick={() => router.push('/')}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t.checkout.title}</h1>

      <div className={styles.grid}>
        {/* Left Column - Shipping & Payment */}
        <div className={styles.leftColumn}>
          {/* Shipping Address */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.checkout.shippingAddress}</h2>
            
            {addresses.length === 0 ? (
              <div className={styles.noAddress}>
                <p>{t.checkout.noAddress}</p>
                <Button variant="primary" onClick={() => router.push('/account/addresses?returnUrl=/checkout')}>
                  {t.checkout.addAddress}
                </Button>
              </div>
            ) : showAddressSelector ? (
              <div className={styles.addressSelector}>
                <p className={styles.selectorLabel}>{t.checkout.selectAddress}</p>
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`${styles.addressOption} ${
                      selectedAddressId === address.id ? styles.selectedOption : ''
                    }`}
                    onClick={() => {
                      setSelectedAddressId(address.id);
                      setShowAddressSelector(false);
                    }}
                  >
                    {address.isDefault && (
                      <span className={styles.defaultBadge}>{t.account.addresses.default}</span>
                    )}
                    <p className={styles.addressName}>{address.fullName}</p>
                    <p className={styles.addressText}>
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className={styles.addressText}>
                      {address.city}, {address.state}
                      {address.postalCode && ` ${address.postalCode}`}
                    </p>
                    {address.phone && (
                      <p className={styles.addressText}>{address.phone}</p>
                    )}
                  </div>
                ))}
                <div className={styles.selectorActions}>
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => router.push('/account/addresses?returnUrl=/checkout')}
                  >
                    {t.checkout.addAddress}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => setShowAddressSelector(false)}
                  >
                    {t.common.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {selectedAddress && (
                  <div className={styles.addressCard}>
                    {selectedAddress.isDefault && (
                      <span className={styles.defaultBadge}>{t.account.addresses.default}</span>
                    )}
                    <p className={styles.addressName}>{selectedAddress.fullName}</p>
                    <p className={styles.addressText}>
                      {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                    </p>
                    <p className={styles.addressText}>
                      {selectedAddress.city}, {selectedAddress.state}
                      {selectedAddress.postalCode && ` ${selectedAddress.postalCode}`}
                    </p>
                    {selectedAddress.phone && (
                      <p className={styles.addressText}>{selectedAddress.phone}</p>
                    )}
                  </div>
                )}
                
                {addresses.length > 0 && (
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => setShowAddressSelector(true)}
                  >
                    {t.checkout.changeAddress}
                  </Button>
                )}
              </>
            )}
          </section>

          {/* Payment Method */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.checkout.paymentMethod}</h2>
            
            <div className={styles.paymentMethods}>
              <label className={`${styles.paymentOption} ${paymentMethod === 'PSE' ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="PSE"
                  checked={paymentMethod === 'PSE'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>{t.checkout.pse}</span>
              </label>
              
              <label className={`${styles.paymentOption} ${paymentMethod === 'CREDIT_CARD' ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CREDIT_CARD"
                  checked={paymentMethod === 'CREDIT_CARD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled
                />
                <span>{t.checkout.creditCard} (Próximamente)</span>
              </label>
            </div>

            {/* PSE Payment Form */}
            {paymentMethod === 'PSE' && (
              <PSEPaymentForm 
                onDataChange={(data) => setPsePaymentData(data)}
              />
            )}
          </section>

          {/* Notes */}
          <section className={styles.section}>
            <label htmlFor="notes" className={styles.notesLabel}>
              {t.checkout.notes}
            </label>
            <textarea
              id="notes"
              className={styles.notesTextarea}
              placeholder={t.checkout.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </section>
        </div>

        {/* Right Column - Order Summary */}
        <div className={styles.rightColumn}>
          <section className={styles.summary}>
            <h2 className={styles.summaryTitle}>{t.checkout.orderSummary}</h2>
            
            {/* Items */}
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemQuantity}>x{item.quantity}</p>
                  </div>
                  <p className={styles.itemPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>{t.checkout.subtotal}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              <div className={styles.totalRow}>
                <span>{t.checkout.shipping}</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className={styles.freeShipping}>{t.product.freeShipping}</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              
              <div className={styles.totalRow}>
                <span>{t.checkout.tax}</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>
              
              <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                <span>{t.checkout.total}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              variant="primary"
              size="large"
              onClick={handlePlaceOrder}
              disabled={isProcessing || addresses.length === 0}
              className={styles.placeOrderButton}
            >
              {isProcessing ? t.checkout.processing : t.checkout.placeOrder}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
