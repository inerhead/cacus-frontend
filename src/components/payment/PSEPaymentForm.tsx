'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { banksApi } from '@/lib/api/banks';
import styles from './PSEPaymentForm.module.css';

interface PSEPaymentFormProps {
  onDataChange?: (data: PSEPaymentData) => void;
}

export interface PSEPaymentData {
  personType: 'natural' | 'juridica';
  bankCode: string;
}

interface BankOption {
  code: string;
  name: string;
}

export default function PSEPaymentForm({ onDataChange }: PSEPaymentFormProps) {
  const t = useTranslation();
  const [personType, setPersonType] = useState<'natural' | 'juridica'>('natural');
  const [bankCode, setBankCode] = useState<string>('');
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  // Load active banks from API
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const activeBanks = await banksApi.getActive('CO');
        setBanks(activeBanks.map(b => ({ code: b.code, name: b.name })));
      } catch (error) {
        console.error('Error loading banks:', error);
        // Fallback to empty array - could show error message
        setBanks([]);
      } finally {
        setLoadingBanks(false);
      }
    };

    loadBanks();
  }, []);

  const handlePersonTypeChange = (type: 'natural' | 'juridica') => {
    setPersonType(type);
    if (onDataChange) {
      onDataChange({ personType: type, bankCode });
    }
  };

  const handleBankChange = (code: string) => {
    setBankCode(code);
    if (onDataChange) {
      onDataChange({ personType, bankCode: code });
    }
  };

  return (
    <div className={styles.pseForm}>
      {/* Person Type Selection */}
      <div className={styles.section}>
        <div className={styles.personTypeOptions}>
          <label 
            className={`${styles.personTypeOption} ${personType === 'juridica' ? styles.selected : ''}`}
          >
            <input
              type="radio"
              name="personType"
              value="juridica"
              checked={personType === 'juridica'}
              onChange={() => handlePersonTypeChange('juridica')}
              className={styles.radio}
            />
            <span className={styles.personTypeLabel}>
              {t.payment.pse.legalEntity}
            </span>
          </label>

          <label 
            className={`${styles.personTypeOption} ${personType === 'natural' ? styles.selected : ''}`}
          >
            <input
              type="radio"
              name="personType"
              value="natural"
              checked={personType === 'natural'}
              onChange={() => handlePersonTypeChange('natural')}
              className={styles.radio}
            />
            <span className={styles.personTypeLabel}>
              {t.payment.pse.naturalPerson}
            </span>
          </label>
        </div>
      </div>

      {/* Bank Selection */}
      <div className={styles.section}>
        <label htmlFor="bank" className={styles.label}>
          {t.payment.pse.selectBank}
        </label>
        <select
          id="bank"
          value={bankCode}
          onChange={(e) => handleBankChange(e.target.value)}
          className={styles.bankSelect}
          required
          disabled={loadingBanks}
        >
          <option value="" disabled>
            {loadingBanks ? 'Cargando bancos...' : t.payment.pse.selectBankPlaceholder}
          </option>
          {banks.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
