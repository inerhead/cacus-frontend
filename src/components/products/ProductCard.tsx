'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Eye } from 'lucide-react';
import appSettings from '@/config/settings';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  isNew?: boolean;
  hasFreeShipping?: boolean;
  compareAtPrice?: number;
  showDeliveryOptions?: boolean;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  imageUrl,
  isNew = false,
  hasFreeShipping,
  compareAtPrice,
  showDeliveryOptions,
}: ProductCardProps) {
  // Use settings for defaults
  const settings = appSettings;
  const defaultImage = imageUrl || settings.images.productPlaceholder;
  const shouldShowDelivery = showDeliveryOptions ?? settings.products.showDeliveryOptions;
  const qualifiesForFreeShipping = hasFreeShipping ?? (price >= settings.shipping.freeShippingThreshold);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: settings.shipping.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const discountPercentage = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <div className="product-card group">
      {/* Image Container */}
      <Link href={`/productos/${slug}`} className="block">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <Image
            src={defaultImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={settings.images.quality}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
            {isNew && (
              <span 
                className="badge-new"
                style={{
                  backgroundColor: settings.badges.new.backgroundColor,
                  color: settings.badges.new.textColor,
                }}
              >
                {settings.badges.new.text}
              </span>
            )}
            {qualifiesForFreeShipping && (
              <span 
                className="badge-shipping"
                style={{
                  backgroundColor: settings.badges.freeShipping.backgroundColor,
                  color: settings.badges.freeShipping.textColor,
                }}
              >
                {settings.badges.freeShipping.text} *
              </span>
            )}
            {discountPercentage > 0 && (
              <span 
                className="badge-offer"
                style={{
                  backgroundColor: settings.badges.discount.backgroundColor,
                  color: settings.badges.discount.textColor,
                }}
              >
                -{discountPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 text-black uppercase line-clamp-2 min-h-[3.5rem]">
            {name}
          </h3>
          
          {/* Price */}
          <div className="mb-3">
            {compareAtPrice && (
              <p className="text-gray-500 line-through text-sm mb-1">
                {formatPrice(compareAtPrice)}
              </p>
            )}
            <p className="text-2xl font-bold text-black">
              {formatPrice(price)}
            </p>
          </div>

          {/* Delivery Options */}
          {shouldShowDelivery && (
            <div className="flex gap-2 mb-3 text-xs">
              <span className="flex items-center gap-1 text-lego-red">
                <span>🚚</span>
                ENVÍO MISMO DÍA
              </span>
              <span className="flex items-center gap-1 text-lego-red">
                <span>🏪</span>
                RECOGE EN TIENDA
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Action Buttons - Outside Link to avoid nesting issues */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Add to cart logic
            console.log('Add to cart:', id);
          }}
          className="btn-lego flex-1 flex items-center justify-center gap-2 text-sm"
          aria-label="Agregar al carrito"
        >
          <ShoppingCart className="w-4 h-4" />
          Agregar al carrito
        </button>
        <Link
          href={`/productos/${slug}`}
          className="btn-lego-secondary flex items-center justify-center gap-2 text-sm px-4"
          aria-label="Ver más detalles"
        >
          <Eye className="w-4 h-4" />
          Ver más
        </Link>
      </div>
    </div>
  );
}

