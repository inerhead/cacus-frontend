'use client';

import { useTranslation } from '@/contexts/LanguageContext';
import Button from './Button';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'info',
}: ConfirmDialogProps) {
  const t = useTranslation();

  if (!isOpen) return null;

  const variantMap = {
    danger: 'danger' as const,
    warning: 'primary' as const,
    info: 'secondary' as const,
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {title || t.common.confirm}
          </h3>
        </div>
        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
        </div>
        <div className={styles.footer}>
          <Button
            variant="ghost"
            size="medium"
            onClick={onCancel}
          >
            {cancelText || t.common.cancel}
          </Button>
          <Button
            variant={variantMap[type]}
            size="medium"
            onClick={onConfirm}
          >
            {confirmText || t.common.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}

