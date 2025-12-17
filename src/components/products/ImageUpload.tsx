'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadIcon, DeleteIcon } from '../ui/icons';
import Button from '../ui/Button';
import styles from './ImageUpload.module.css';

export interface ProductImage {
  id?: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  preview?: string; // For local preview before upload
  file?: File; // For pending uploads
}

interface ImageUploadProps {
  productId?: string;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
  onUpload?: (file: File, altText?: string) => Promise<ProductImage>;
  onDelete?: (imageId: string) => Promise<void>;
  onSetPrimary?: (imageId: string) => Promise<void>;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  translations?: {
    imageMaxLimit: string;
    imageInvalidType: string;
    imageMaxSize: string;
    dragOrUpload?: string;
    uploading?: string;
    uploadButton?: string;
    imageTitle?: string;
    imageHint?: string;
    imagePrimary?: string;
  };
  disabled?: boolean;
}

export default function ImageUpload({
  productId,
  images,
  onChange,
  maxImages = 5,
  maxSizeInMB = 2,
  onUpload,
  onDelete,
  onSetPrimary,
  onShowToast,
  translations,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate number of images
    if (images.length + files.length > maxImages) {
      const message = translations?.imageMaxLimit.replace('{max}', String(maxImages)) || `Máximo ${maxImages} imágenes permitidas`;
      if (onShowToast) {
        onShowToast(message, 'error');
      } else {
        alert(message);
      }
      return;
    }

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const message = translations?.imageInvalidType.replace('{name}', file.name) || `${file.name} no es un archivo de imagen válido`;
        if (onShowToast) {
          onShowToast(message, 'error');
        } else {
          alert(message);
        }
        continue;
      }

      // Validate file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        const message = translations?.imageMaxSize.replace('{name}', file.name).replace('{max}', String(maxSizeInMB)) || `${file.name} excede el tamaño máximo de ${maxSizeInMB}MB`;
        if (onShowToast) {
          onShowToast(message, 'error');
        } else {
          alert(message);
        }
        continue;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      const newImage: ProductImage = {
        url: preview,
        preview,
        file,
        altText: file.name,
        sortOrder: images.length,
        isPrimary: images.length === 0, // First image is primary
      };

      // If productId exists and onUpload provided, upload immediately
      if (productId && onUpload) {
        try {
          setUploading(true);
          await onUpload(file);
          // Parent component handles state update via handleImageUpload
        } catch (error) {
          console.error('Error uploading image:', error);
          // Parent component shows error toast
        } finally {
          setUploading(false);
        }
      } else {
        // Otherwise, add to local state
        onChange([...images, newImage]);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (index: number) => {
    const image = images[index];

    // If image has ID and onDelete provided, delete from server
    if (image.id && onDelete) {
      try {
        await onDelete(image.id);
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Error al eliminar la imagen');
        return;
      }
    }

    // Remove from local state
    const newImages = images.filter((_, i) => i !== index);

    // If removed image was primary, set first image as primary
    if (image.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }

    // Update sortOrder
    newImages.forEach((img, i) => {
      img.sortOrder = i;
    });

    // Clean up preview URL
    if (image.preview) {
      URL.revokeObjectURL(image.preview);
    }

    onChange(newImages);
  };

  const handleSetPrimary = async (index: number) => {
    const image = images[index];

    // If image has ID and onSetPrimary provided, update on server
    if (image.id && onSetPrimary) {
      try {
        await onSetPrimary(image.id);
      } catch (error) {
        console.error('Error setting primary image:', error);
        alert('Error al establecer imagen principal');
        return;
      }
    }

    // Update local state
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));

    onChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    // Update sortOrder
    newImages.forEach((img, i) => {
      img.sortOrder = i;
    });

    setDraggedIndex(index);
    onChange(newImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label className={styles.label}>
          {translations?.imageTitle || 'Imágenes del Producto'} ({images.length}/{maxImages})
        </label>
        <p className={styles.hint}>
          {translations?.imageHint?.replace('{max}', maxSizeInMB.toString()) || `Formatos: JPEG, PNG, WebP. Máximo ${maxSizeInMB}MB por imagen. Arrastra para reordenar.`}
        </p>
      </div>

      <div className={styles.grid}>
        {images.filter(img => img && (img.url || img.preview)).map((image, index) => (
          <div
            key={image.id || index}
            className={`${styles.imageCard} ${draggedIndex === index ? styles.dragging : ''}`}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={image.preview || image.url || ''}
                alt={image.altText || `Product image ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
              />
              {image.isPrimary && (
                <div className={styles.primaryBadge}>{translations?.imagePrimary || 'Principal'}</div>
              )}
              <div className={styles.orderBadge}>{index + 1}</div>
            </div>

            <div className={styles.actions}>
              {!image.isPrimary && (
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={() => handleSetPrimary(index)}
                  disabled={disabled}
                >
                  ⭐ {translations?.imagePrimary || 'Principal'}
                </Button>
              )}
              <Button
                type="button"
                variant="danger"
                size="icon"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <DeleteIcon size={16} />
              </Button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <div className={styles.uploadCard}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className={styles.fileInput}
              disabled={disabled || uploading}
            />
            <Button
              type="button"
              variant="primary"
              size="medium"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              loading={uploading}
              icon={<UploadIcon size={20} />}
            >
              {uploading ? translations?.uploading || 'Subiendo...' : translations?.uploadButton || 'Subir Imagen'}
            </Button>
            <p className={styles.uploadHint}>
              {translations?.dragOrUpload || 'o arrastra archivos aquí'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
