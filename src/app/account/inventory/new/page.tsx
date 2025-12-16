'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { useToastContext } from '@/contexts/ToastContext';
import { productsApi } from '@/lib/api/products';
import Button from '@/components/ui/Button';
import styles from './new-product.module.css';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const { showToast } = useToastContext();
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    shortDescription: '',
    longDescription: '',
    price: '',
    compareAtPrice: '',
    stockQuantity: '',
    lowStockThreshold: '10',
    brand: '',
    material: '',
    status: 'draft' as 'active' | 'draft' | 'archived',
    isFeatured: false,
    isNew: false,
    allowBackorder: false,
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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

    if (session && userRole === 'admin') {
      loadCategories();
    }
  }, [status, session, router]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      // TODO: Implement categories API
      // For now, using mock data
      setCategories([
        { id: '1', name: 'Desarrollo y Aprendizaje', slug: 'desarrollo-aprendizaje' },
        { id: '2', name: 'Bloques y Construcción', slug: 'bloques-construccion' },
        { id: '3', name: 'Ciencia y Experimentos', slug: 'ciencia-experimentos' },
        { id: '4', name: 'Arte y Creatividad', slug: 'arte-creatividad' },
        { id: '5', name: 'Música', slug: 'musica' },
        { id: '6', name: 'Robótica y Programación', slug: 'robotica-programacion' },
      ]);
    } catch (err) {
      console.error('Error loading categories:', err);
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

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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

      await productsApi.create(productData, accessToken);
      
      // Save toast message to sessionStorage for display after redirect
      sessionStorage.setItem('toastMessage', t.inventory.messages.createSuccess);
      sessionStorage.setItem('toastType', 'success');
      
      router.push('/account/inventory');
    } catch (err) {
      console.error('Error creating product:', err);
      showToast(t.inventory.messages.createError, 'error');
    } finally {
      setSubmitting(false);
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
          <h1 className={styles.title}>{t.inventory.newProduct}</h1>
          <Button 
            variant="primary"
            size="medium"
            onClick={() => router.push('/account/inventory')}
            type="button"
          >
            ← {t.inventory.backToInventory}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.inventory.form.basicInfo}</h2>
            
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
              <label htmlFor="name" className={styles.label}>
                {t.inventory.form.productName} <span className={styles.required}>{t.inventory.form.required}</span>
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
              <label htmlFor="longDescription" className={styles.label}>
                {t.inventory.form.longDescription}
              </label>
              <textarea
                id="longDescription"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={5}
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
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="stockQuantity" className={styles.label}>
                  {t.inventory.form.stockQuantity}
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

              <div className={styles.formGroup}>
                <label htmlFor="lowStockThreshold" className={styles.label}>
                  {t.inventory.form.lowStockThreshold}
                </label>
                <input
                  type="number"
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleInputChange}
                  className={styles.input}
                  min="0"
                  placeholder={t.inventory.form.stockPlaceholder}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.inventory.form.productDetails}</h2>
            
            <div className={styles.formRow}>
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

              <div className={styles.formGroup}>
                <label htmlFor="material" className={styles.label}>
                  {t.inventory.form.material}
                </label>
                <input
                  type="text"
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder={t.inventory.form.materialPlaceholder}
                />
              </div>
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
                <span>{t.inventory.form.productFeatured}</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span>{t.inventory.form.productNew}</span>
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
            <Button
              type="button"
              variant="ghost"
              size="medium"
              onClick={() => router.push('/account/inventory')}
              disabled={submitting}
            >
              {t.inventory.form.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="medium"
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? t.inventory.form.creating : t.inventory.form.create}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
