'use client';

import { useState, FormEvent } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { CreateAddressData, UpdateAddressData, Address } from '@/lib/api/addresses';
import styles from './AddressForm.module.css';

interface AddressFormProps {
  address?: Address;
  onSubmit: (data: CreateAddressData | UpdateAddressData) => Promise<void>;
  onCancel: () => void;
}

export default function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  const t = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateAddressData>({
    fullName: address?.fullName || '',
    addressLine1: address?.addressLine1 || '',
    addressLine2: address?.addressLine2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    country: address?.country || 'CO',
    phone: address?.phone || '',
    isDefault: address?.isDefault || false,
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = t.account.addresses.form.required;
    }
    if (!formData.addressLine1?.trim()) {
      newErrors.addressLine1 = t.account.addresses.form.required;
    }
    if (!formData.city?.trim()) {
      newErrors.city = t.account.addresses.form.required;
    }
    if (!formData.state?.trim()) {
      newErrors.state = t.account.addresses.form.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateAddressData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>
        {address ? t.account.addresses.form.editTitle : t.account.addresses.form.title}
      </h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Row 1: Full Name + Phone */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="fullName" className={styles.label}>
              {t.account.addresses.form.fullName} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder={t.account.addresses.form.fullNamePlaceholder}
              className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              required
            />
            {errors.fullName && (
              <span className={styles.errorMessage}>{errors.fullName}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              {t.account.addresses.form.phone}
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder={t.account.addresses.form.phonePlaceholder}
              className={styles.input}
            />
          </div>
        </div>

        {/* Row 2: Address Line 1 + Address Line 2 */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="addressLine1" className={styles.label}>
              {t.account.addresses.form.addressLine1} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              placeholder={t.account.addresses.form.addressLine1Placeholder}
              className={`${styles.input} ${errors.addressLine1 ? styles.inputError : ''}`}
              required
            />
            {errors.addressLine1 && (
              <span className={styles.errorMessage}>{errors.addressLine1}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="addressLine2" className={styles.label}>
              {t.account.addresses.form.addressLine2}
            </label>
            <input
              type="text"
              id="addressLine2"
              value={formData.addressLine2}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
              placeholder={t.account.addresses.form.addressLine2Placeholder}
              className={styles.input}
            />
          </div>
        </div>

        {/* Row 3: City + State */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="city" className={styles.label}>
              {t.account.addresses.form.city} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder={t.account.addresses.form.cityPlaceholder}
              className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
              required
            />
            {errors.city && (
              <span className={styles.errorMessage}>{errors.city}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="state" className={styles.label}>
              {t.account.addresses.form.state} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder={t.account.addresses.form.statePlaceholder}
              className={`${styles.input} ${errors.state ? styles.inputError : ''}`}
              required
            />
            {errors.state && (
              <span className={styles.errorMessage}>{errors.state}</span>
            )}
          </div>
        </div>

        {/* Row 4: Postal Code + Country (disabled) */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="postalCode" className={styles.label}>
              {t.account.addresses.form.postalCode}
            </label>
            <input
              type="text"
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              placeholder={t.account.addresses.form.postalCodePlaceholder}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="country" className={styles.label}>
              {t.account.addresses.form.country}
            </label>
            <input
              type="text"
              id="country"
              value="Colombia"
              disabled
              className={`${styles.input} ${styles.inputDisabled}`}
            />
          </div>
        </div>

        {/* Row 5: Default checkbox */}
        <div className={styles.checkboxRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => handleChange('isDefault', e.target.checked)}
              className={styles.checkbox}
            />
            <span>{t.account.addresses.form.isDefault}</span>
          </label>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            {t.account.addresses.form.cancel}
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? t.account.addresses.form.saving : t.account.addresses.form.save}
          </button>
        </div>
      </form>
    </div>
  );
}

