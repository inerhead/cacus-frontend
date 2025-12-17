'use client';

import { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import styles from './ProviderForm.module.css';

interface EpaycoFormProps {
  onSubmit: (data: EpaycoConfig) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<EpaycoConfig>;
}

export interface EpaycoConfig {
  name: string;
  publicKey: string;
  privateKey: string;
  isTestMode: boolean;
  isEnabled: boolean;
}

export default function EpaycoForm({ onSubmit, onCancel, initialData }: EpaycoFormProps) {
  const t = useTranslation();
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState<EpaycoConfig>({
    name: initialData?.name || 'ePayco Colombia',
    publicKey: initialData?.publicKey || '',
    privateKey: initialData?.privateKey || '',
    isTestMode: initialData?.isTestMode ?? true,
    isEnabled: initialData?.isEnabled ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.publicKey.trim()) {
      newErrors.publicKey = 'La llave pública es obligatoria';
    }

    if (!formData.privateKey.trim()) {
      newErrors.privateKey = 'La llave privada es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted, validating...', formData);
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    console.log('Validation passed, submitting...');
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await onSubmit(formData);
      console.log('Submit successful');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      let errorMsg = 'Error al guardar la configuración';
      
      if (error.message) {
        errorMsg = error.message;
      } else if (error.response?.status === 401) {
        errorMsg = '🔒 Tu sesión ha expirado. Recarga la página e inicia sesión nuevamente.';
      } else if (error.response?.status === 403) {
        errorMsg = '⛔ Solo administradores pueden configurar proveedores de pago.';
      }
      
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof EpaycoConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {isEditMode ? 'Editar ePayco' : 'Configurar ePayco'}
        </h2>
        <p className={styles.subtitle}>
          Popular en Colombia, fácil integración con PSE y tarjetas de crédito
        </p>
      </div>

      {submitError && (
        <div className={styles.errorBanner}>
          {submitError}
        </div>
      )}

      <div className={styles.formContent}>
        {/* Name */}
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Nombre del proveedor *
          </label>
          <input
            type="text"
            id="name"
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ej: ePayco Colombia"
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>

        {/* Public Key */}
        <div className={styles.field}>
          <label htmlFor="publicKey" className={styles.label}>
            Llave Pública (Public Key) *
          </label>
          <input
            type="text"
            id="publicKey"
            className={`${styles.input} ${errors.publicKey ? styles.inputError : ''}`}
            value={formData.publicKey}
            onChange={(e) => handleChange('publicKey', e.target.value)}
            placeholder="Ej: 1a2b3c4d5e6f7g8h9i0j"
          />
          {errors.publicKey && <span className={styles.error}>{errors.publicKey}</span>}
          <p className={styles.hint}>
            Encuéntrala en tu panel de ePayco → Integración → Llaves
          </p>
        </div>

        {/* Private Key */}
        <div className={styles.field}>
          <label htmlFor="privateKey" className={styles.label}>
            Llave Privada (Private Key) *
          </label>
          <input
            type="password"
            id="privateKey"
            className={`${styles.input} ${errors.privateKey ? styles.inputError : ''}`}
            value={formData.privateKey}
            onChange={(e) => handleChange('privateKey', e.target.value)}
            placeholder="••••••••••••••••••••"
          />
          {errors.privateKey && <span className={styles.error}>{errors.privateKey}</span>}
          <p className={styles.hint}>
            Esta llave es secreta y nunca se mostrará después de guardar
          </p>
        </div>

        {/* Test Mode */}
        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.isTestMode}
              onChange={(e) => handleChange('isTestMode', e.target.checked)}
              className={styles.checkbox}
            />
            <span>Modo de prueba (Sandbox)</span>
          </label>
          <p className={styles.hint}>
            Activa esto para usar las llaves de prueba de ePayco
          </p>
        </div>

        {/* Enabled */}
        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => {
                console.log('isEnabled changed:', e.target.checked);
                handleChange('isEnabled', e.target.checked);
              }}
              className={styles.checkbox}
            />
            <span>Activar proveedor</span>
          </label>
          <p className={styles.hint}>
            Los usuarios podrán pagar con ePayco si está activado
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t.common.cancel}
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? 'Guardando...' 
            : isEditMode 
              ? 'Actualizar Configuración' 
              : 'Guardar Configuración'
          }
        </Button>
      </div>
    </form>
  );
}
