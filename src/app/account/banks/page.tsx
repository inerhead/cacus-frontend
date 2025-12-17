'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { banksApi, Bank, CreateBankDto } from '@/lib/api/banks';
import Button from '@/components/ui/Button';
import { EditIcon, DeleteIcon } from '@/components/ui/icons';
import styles from './banks.module.css';

export default function BanksAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateBankDto>({
    code: '',
    name: '',
    country: 'CO',
    isActive: true,
    sortOrder: 0,
    logoUrl: '',
  });
  const [formError, setFormError] = useState<string>('');

  const loadBanks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await banksApi.getAll();
      setBanks(data);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading banks:', error);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin
    const userRole = (session?.user as any)?.role;
    if (status === 'authenticated' && userRole !== 'ADMIN') {
      router.push('/account');
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'ADMIN' && !hasLoaded) {
      loadBanks();
    }
  }, [status, hasLoaded, loadBanks, session]);

  // Apply filter whenever banks or statusFilter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredBanks(banks);
    } else if (statusFilter === 'active') {
      setFilteredBanks(banks.filter(b => b.isActive));
    } else if (statusFilter === 'inactive') {
      setFilteredBanks(banks.filter(b => !b.isActive));
    }
  }, [banks, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingBank) {
        await banksApi.update(editingBank.id, formData);
      } else {
        await banksApi.create(formData);
      }
      
      setShowForm(false);
      setEditingBank(null);
      resetForm();
      await loadBanks();
    } catch (error: any) {
      setFormError(error.response?.data?.message || error.message || 'Error al guardar el banco');
    }
  };

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setFormData({
      code: bank.code,
      name: bank.name,
      country: bank.country,
      isActive: bank.isActive,
      sortOrder: bank.sortOrder,
      logoUrl: bank.logoUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este banco?')) return;
    
    try {
      await banksApi.delete(id);
      await loadBanks();
    } catch (error) {
      alert('Error al eliminar banco');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await banksApi.toggleActive(id);
      await loadBanks();
    } catch (error) {
      alert('Error al cambiar estado');
    }
  };

  const handleImport = async () => {
    setImportResult(null);
    
    try {
      const banksData = JSON.parse(importText);
      const result = await banksApi.importBanks({ banks: banksData });
      setImportResult(result);
      
      if (result.failed === 0) {
        setImportText('');
        setShowImport(false);
        await loadBanks();
      }
    } catch (error: any) {
      setImportResult({
        success: 0,
        failed: 1,
        errors: [error.message || 'Error al importar bancos'],
      });
    }
  };

  const handleExport = () => {
    // Export filtered banks to JSON
    const dataToExport = filteredBanks.map(bank => ({
      code: bank.code,
      name: bank.name,
      country: bank.country,
      isActive: bank.isActive,
      sortOrder: bank.sortOrder,
      logoUrl: bank.logoUrl || '',
    }));

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bancos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      country: 'CO',
      isActive: true,
      sortOrder: 0,
      logoUrl: '',
    });
    setFormError('');
  };

  const exampleImportData = [
    { code: 'bancolombia', name: 'Bancolombia', country: 'CO', isActive: true, sortOrder: 1 },
    { code: 'banco_bogota', name: 'Banco de Bogotá', country: 'CO', isActive: true, sortOrder: 2 },
    { code: 'davivienda', name: 'Davivienda', country: 'CO', isActive: true, sortOrder: 3 },
  ];

  if (status === 'loading' || !session) {
    return <div className={styles.container}><div className={styles.loading}>Cargando...</div></div>;
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
              ← Volver al Perfil
            </Button>
            <h1 className={styles.title}>Administración de Bancos</h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Estado:</label>
              <select 
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.actionsBar}>
          <div className={styles.headerActions}>
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowImport(!showImport);
                setShowForm(false);
              }}
              title="Importar bancos"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleExport}
              title="Exportar bancos"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={() => {
                setShowForm(!showForm);
                setShowImport(false);
                setEditingBank(null);
                resetForm();
              }}
            >
              + AGREGAR BANCO
            </Button>
          </div>
        </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {editingBank ? 'Editar Banco' : 'Nuevo Banco'}
          </h2>
          
          {formError && (
            <div className={styles.error}>{formError}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Código *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="bancolombia"
                  required
                  disabled={!!editingBank}
                />
                <small>Identificador único (sin espacios, minúsculas)</small>
              </div>

              <div className={styles.formGroup}>
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Bancolombia"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>País</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="CO"
                  maxLength={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Orden</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>URL del Logo (opcional)</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Banco activo</span>
              </label>
            </div>

            <div className={styles.formActions}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingBank(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editingBank ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Import Section */}
      {showImport && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Importar Bancos</h2>
          
          <p className={styles.importHint}>
            Pega un JSON con un array de bancos. Formato:
          </p>
          <pre className={styles.exampleCode}>
            {JSON.stringify(exampleImportData, null, 2)}
          </pre>

          <textarea
            className={styles.importTextarea}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Pega aquí el JSON..."
            rows={10}
          />

          {importResult && (
            <div className={importResult.failed > 0 ? styles.error : styles.success}>
              <p><strong>Resultado:</strong></p>
              <p>✅ Exitosos: {importResult.success}</p>
              {importResult.failed > 0 && (
                <>
                  <p>❌ Fallidos: {importResult.failed}</p>
                  <ul>
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          <div className={styles.formActions}>
            <Button variant="ghost" onClick={() => setShowImport(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleImport}>
              Importar
            </Button>
          </div>
        </div>
      )}

      {/* Banks Table */}
      {loading ? (
        <div className={styles.loading}>Cargando...</div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>País</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.empty}>
                      {statusFilter === 'all' 
                        ? 'No hay bancos configurados. Agrega bancos manualmente o usa la función de importación masiva.'
                        : `No hay bancos ${statusFilter === 'active' ? 'activos' : 'inactivos'}.`
                      }
                    </td>
                  </tr>
                ) : (
                  filteredBanks.map((bank) => (
                    <tr key={bank.id}>
                      <td className={styles.code}>{bank.code}</td>
                      <td className={styles.bankName}>{bank.name}</td>
                      <td className={styles.country}>{bank.country}</td>
                      <td className={styles.sortOrder}>{bank.sortOrder}</td>
                      <td>
                        <span className={`${styles.badge} ${bank.isActive ? styles.active : styles.inactive}`}>
                          {bank.isActive ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleEdit(bank)}
                          title="Editar banco"
                        >
                          <EditIcon size={18} />
                        </Button>
                        <Button
                          variant={bank.isActive ? 'ghost' : 'primary'}
                          size="icon"
                          onClick={() => handleToggleActive(bank.id)}
                          title={bank.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {bank.isActive ? '👁️‍🗨️' : '✅'}
                        </Button>
                        <Button
                          variant="danger"
                          size="icon"
                          onClick={() => handleDelete(bank.id)}
                          title="Eliminar banco"
                        >
                          <DeleteIcon size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
