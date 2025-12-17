'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ImagePreviewModal.module.css';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string;
  imageAlt: string;
  onClose: () => void;
}

export default function ImagePreviewModal({ isOpen, imageUrl, imageAlt, onClose }: ImagePreviewModalProps) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) {
    return null;
  }

  const modalContent = (
    <div 
      className={styles.modal}
      onClick={onClose}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
        <img 
          src={imageUrl} 
          alt={imageAlt}
          className={styles.previewImage}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
