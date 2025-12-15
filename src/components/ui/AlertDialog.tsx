'use client';

import { useTranslation } from '@/contexts/LanguageContext';
import styles from './AlertDialog.module.css';

interface AlertDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export default function AlertDialog({
  isOpen,
  title,
  message,
  buttonText,
  onClose,
  type = 'info',
}: AlertDialogProps) {
  const t = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.header} ${styles[type]}`}>
          <h3 className={styles.title}>
            {title || (type === 'error' ? t.common.error : type === 'success' ? t.common.success : t.common.info)}
          </h3>
        </div>
        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
        </div>
        <div className={styles.footer}>
          <button
            className={`${styles.button} ${styles[type]}`}
            onClick={onClose}
          >
            {buttonText || t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
}

