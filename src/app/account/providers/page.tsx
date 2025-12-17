'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/ToastContainer';
import paymentProvidersApi, { PaymentProvider } from '@/lib/api/payment-providers';
import EpaycoForm, { EpaycoConfig } from '@/components/providers/EpaycoForm';
import styles from './providers.module.css';

export default function PaymentProvidersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const { toasts, showToast, removeToast } = useToast();
  
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<PaymentProvider | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEpaycoForm, setShowEpaycoForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadProviders();
    }
  }, [status, router]);

  const loadProviders = async () => {
    try {
      const data = await paymentProvidersApi.getAll();
      setProviders(data);
    } catch (error) {
      showToast('Error al cargar proveedores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (id: string) => {
    try {
      await paymentProvidersApi.toggleEnabled(id);
      showToast('Estado actualizado', 'success');
      loadProviders();
    } catch (error) {
      showToast('Error al actualizar estado', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    
    try {
      await paymentProvidersApi.delete(id);
      showToast('Proveedor eliminado', 'success');
      loadProviders();
    } catch (error) {
      showToast('Error al eliminar proveedor', 'error');
    }
  };

  const handleEpaycoSubmit = async (config: EpaycoConfig) => {
    console.log('handleEpaycoSubmit called with:', config);
    
    try {
      if (editingProvider) {
        // Update existing provider
        console.log('Updating provider:', editingProvider.id);
        const result = await paymentProvidersApi.update(editingProvider.id, {
          provider: 'EPAYCO',
          name: config.name,
          isEnabled: config.isEnabled,
          isTestMode: config.isTestMode,
          config: {
            publicKey: config.publicKey,
            privateKey: config.privateKey,
          },
        });
        console.log('Provider updated successfully:', result);
        showToast('✅ ePayco actualizado exitosamente', 'success');
        setEditingProvider(null);
      } else {
        // Create new provider
        console.log('Creating provider...');
        const result = await paymentProvidersApi.create({
          provider: 'EPAYCO',
          name: config.name,
          isEnabled: config.isEnabled,
          isTestMode: config.isTestMode,
          config: {
            publicKey: config.publicKey,
            privateKey: config.privateKey,
          },
        });
        console.log('Provider created successfully:', result);
        showToast('✅ ePayco configurado exitosamente', 'success');
      }
      
      setShowEpaycoForm(false);
      setShowAddForm(false);
      await loadProviders();
    } catch (error: any) {
      console.error('Error saving provider:', error);
      
      let errorMessage = 'Error al configurar ePayco';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = '🔒 Tu sesión ha expirado. Por favor, recarga la página e inicia sesión nuevamente.';
      } else if (error.response?.status === 403) {
        errorMessage = '⛔ No tienes permisos para esta acción. Solo administradores pueden configurar proveedores.';
      } else if (error.response?.status === 409) {
        errorMessage = '⚠️ Este proveedor ya existe. Edita el existente en lugar de crear uno nuevo.';
      }
      
      showToast(errorMessage, 'error');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Proveedores de Pago</h1>
          <p className={styles.subtitle}>
            Configura los proveedores de pago disponibles (PSE, Tarjetas, etc.)
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowAddForm(true)}
        >
          + Agregar Proveedor
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay proveedores configurados</p>
          <p className={styles.emptyHint}>
            Agrega un proveedor de pago para habilitar transacciones PSE o tarjeta de crédito
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {providers.map((provider) => (
            <div key={provider.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.providerName}>{provider.name}</h3>
                  <span className={styles.providerType}>{provider.provider}</span>
                </div>
                <div className={styles.badges}>
                  {provider.isTestMode && (
                    <span className={styles.testBadge}>PRUEBA</span>
                  )}
                  <span 
                    className={provider.isEnabled ? styles.enabledBadge : styles.disabledBadge}
                  >
                    {provider.isEnabled ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.configInfo}>
                  <strong>Configuración:</strong>
                  <ul className={styles.configList}>
                    {Object.keys(provider.config).map((key) => (
                      <li key={key}>
                        <span className={styles.configKey}>{key}:</span>
                        <span className={styles.configValue}>
                          {String(provider.config[key]).includes('key') || 
                           String(provider.config[key]).includes('secret')
                            ? '••••••••'
                            : String(provider.config[key])}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.cardActions}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setEditingProvider(provider);
                    setShowEpaycoForm(true);
                    setShowAddForm(false);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant={provider.isEnabled ? 'ghost' : 'primary'}
                  size="small"
                  onClick={() => handleToggleEnabled(provider.id)}
                >
                  {provider.isEnabled ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleDelete(provider.id)}
                  className={styles.deleteButton}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && !showEpaycoForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Agregar Proveedor de Pago</h2>
            <p className={styles.modalHint}>
              Selecciona el proveedor que deseas configurar
            </p>
            <div className={styles.providerOptions}>
              <button 
                className={styles.providerOption}
                onClick={() => setShowEpaycoForm(true)}
              >
                <strong>ePayco</strong>
                <p>Popular en Colombia, fácil integración</p>
              </button>
              <button 
                className={styles.providerOption}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                <strong>PayU</strong>
                <p>Empresarial, múltiples países (Próximamente)</p>
              </button>
              <button 
                className={styles.providerOption}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                <strong>Mercado Pago</strong>
                <p>Gran cobertura latinoamericana (Próximamente)</p>
              </button>
            </div>
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEpaycoForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <EpaycoForm
              onSubmit={handleEpaycoSubmit}
              onCancel={() => {
                setShowEpaycoForm(false);
                setShowAddForm(false);
                setEditingProvider(null);
              }}
              initialData={editingProvider ? {
                name: editingProvider.name,
                publicKey: editingProvider.config.publicKey,
                privateKey: editingProvider.config.privateKey,
                isTestMode: editingProvider.isTestMode,
                isEnabled: editingProvider.isEnabled,
              } : undefined}
            />
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
