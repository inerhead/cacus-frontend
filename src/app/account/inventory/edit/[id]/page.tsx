'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { useToastContext } from '@/contexts/ToastContext';
import { productsApi, Product } from '@/lib/api/products';
import styles from '../edit-product.module.css';

export default function EditProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const t = useTranslation();
  const { showToast } = useToastContext();
  const productId = params.id as string;
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    shortDescription: '',
    longDescription: '',
    price: '',
    compareAtPrice: '',
    stockQuantity: '',
    lowStockThreshold: '',
    brand: '',
    material: '',
    status: 'draft' as 'active' | 'draft' | 'archived',
    isFeatured: false,
    isNew: false,
    allowBackorder: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const userRole = (session?.user as any)?.role;
    if (status === 'authenticated' && userRole !== 'admin') {
      router.push('/account');
      return;
    }

    if (session && userRole === 'admin' && productId) {
      loadProduct();
    }
  }, [status, session, router, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await productsApi.getById(productId);
      
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        shortDescription: product.shortDescription || '',
        longDescription: product.longDescription || '',
        price: product.price ? String(product.price) : '',
        compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
        stockQuantity: product.stockQuantity ? String(product.stockQuantity) : '',
        lowStockThreshold: product.lowStockThreshold ? String(product.lowStockThreshold) : '10',
        brand: product.brand || '',
        material: product.material || '',
        status: product.status as 'active' | 'draft' | 'archived',
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        allowBackorder: product.allowBackorder || false,
      });
    } catch (err) {
      console.error('Error loading product:', err);
      showToast(t.inventory.messages.loadError, 'error');
      router.push('/account/inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.name || !formData.price) {
      showToast(t.inventory.messages.requiredFields, 'error');
      return;
    }

    try {
      setSubmitting(true);
      const accessToken = (session as any)?.accessToken;
      
      if (!accessToken) {
        showToast(t.inventory.messages.noSession, 'error');
        return;
      }

      const productData = {
        sku: formData.sku,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        shortDescription: formData.shortDescription || undefined,
        longDescription: formData.longDescription || undefined,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        brand: formData.brand || undefined,
        material: formData.material || undefined,
        status: formData.status,
        isFeatured: formData.isFeatured,
        isNew: formData.isNew,
        allowBackorder: formData.allowBackorder,
      };

      await productsApi.update(productId, productData, accessToken);
      
      // Save toast message to sessionStorage for display after redirect
      sessionStorage.setItem('toastMessage', t.inventory.messages.updateSuccess);
      sessionStorage.setItem('toastType', 'success');
      
      router.push('/account/inventory');
    } catch (err) {
      console.error('Error updating product:', err);
      showToast(t.inventory.messages.updateError, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || !session || loading) {
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
          <h1 className={styles.title}>{t.inventory.editProduct}</h1>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/account/inventory')}
            type="button"
          >
            {t.inventory.backToInventory}
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.inventory.form.basicInfo}</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="sku" className={styles.label}>
                  {t.inventory.form.sku} <span className={styles.required}>{t.inventory.form.required}</span>
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  placeholder={t.inventory.form.skuPlaceholder}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="status" className={styles.label}>
                  {t.inventory.form.status}
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="draft">{t.inventory.status.draft}</option>
                  <option value="active">{t.inventory.status.active}</option>
                  <option value="archived">{t.inventory.status.archived}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="brand" className={styles.label}>
                  {t.inventory.form.brand}
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder={t.inventory.form.brandPlaceholder}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                {t.inventory.form.name} <span className={styles.required}>{t.inventory.form.required}</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                required
                placeholder={t.inventory.form.namePlaceholder}
              />
            </div>

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label htmlFor="shortDescription" className={styles.label}>
                  {t.inventory.form.shortDescription}
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows={2}
                  placeholder={t.inventory.form.shortDescriptionPlaceholder}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="material" className={styles.label}>
                  {t.inventory.form.material}
                </label>
                <textarea
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows={2}
                  placeholder={t.inventory.form.materialPlaceholder}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="longDescription" className={styles.label}>
                {t.inventory.form.longDescription}
              </label>
              <textarea
                id="longDescription"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={3}
                placeholder={t.inventory.form.longDescriptionPlaceholder}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.inventory.form.pricesInventory}</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="price" className={styles.label}>
                  {t.inventory.form.price} <span className={styles.required}>{t.inventory.form.required}</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  min="0"
                  step="1"
                  placeholder={t.inventory.form.pricePlaceholder}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="compareAtPrice" className={styles.label}>
                  {t.inventory.form.compareAtPrice}
                </label>
                <input
                  type="number"
                  id="compareAtPrice"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleInputChange}
                  className={styles.input}
                  min="0"
                  step="1"
                  placeholder={t.inventory.form.compareAtPricePlaceholder}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="stockQuantity" className={styles.label}>
                  {t.inventory.form.stock}
                </label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className={styles.input}
                  min="0"
                  placeholder={t.inventory.form.stockPlaceholder}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.inventory.form.options}</h2>
            
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span>{t.inventory.form.featured}</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span>{t.inventory.form.new}</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="allowBackorder"
                  checked={formData.allowBackorder}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span>{t.inventory.form.allowBackorder}</span>
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => router.push('/account/inventory')}
              className={styles.cancelButton}
              disabled={submitting}
            >
              {t.inventory.form.cancel}
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? t.inventory.form.saving : t.inventory.form.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
