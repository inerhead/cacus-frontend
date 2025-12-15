'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import styles from './Toast.module.css';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type, duration = 5000, onClose }: ToastProps) {
  const t = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getTitle = () => {
    switch (type) {
      case 'success':
        return t.common.success;
      case 'error':
        return t.common.error;
      case 'warning':
        return t.common.warning || 'Advertencia';
      case 'info':
        return t.common.info;
      default:
        return '';
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>{getTitle()}</span>
          <button
            className={styles.closeButton}
            onClick={() => onClose(id)}
            aria-label={t.common.close}
          >
            ×
          </button>
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}

