'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import appSettings from '@/config/settings';
import { useTranslation } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import { useToastContext } from '@/contexts/ToastContext';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  hoverImageUrl?: string;
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
  hoverImageUrl,
  isNew = false,
  hasFreeShipping,
  compareAtPrice,
  showDeliveryOptions,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const t = useTranslation();
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const { showToast } = useToastContext();
  // Use settings for defaults
  const settings = appSettings;
  const defaultImage = imageUrl || settings.images.productPlaceholder;
  const shouldShowDelivery = showDeliveryOptions ?? settings.products.showDeliveryOptions;
  const qualifiesForFreeShipping = hasFreeShipping ?? (price >= settings.shipping.freeShippingThreshold);

  const discountPercentage = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <div className="product-card group">
      {/* Image Container */}
      <Link href={`/productos/${slug}`} className="block">
        <div 
          className="relative aspect-square bg-gray-100 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={isHovered && hoverImageUrl ? hoverImageUrl : defaultImage}
            alt={name}
            fill
            className="object-cover transition-all duration-500 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={settings.images.quality}
            unoptimized
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
                {t.product.new.toUpperCase()}
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
                {t.product.freeShipping.toUpperCase()} *
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

          {/* Add to Cart Button - Shows on hover in top right corner */}
          {isHovered && (
            <div className="absolute top-2 right-2 z-20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem({
                    productId: id,
                    name,
                    price,
                    primaryImageUrl: imageUrl,
                    slug,
                  });
                  showToast(`${name} ${t.product.addedToCart || 'agregado al carrito'}`, 'success');
                }}
                className="btn-lego flex items-center justify-center gap-2 text-sm px-4 py-2 shadow-lg hover:scale-105 transition-transform"
                aria-label={t.product.addToCart}
              >
                <ShoppingCart className="w-4 h-4" />
                {t.product.addToCart}
              </button>
            </div>
          )}
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
                {t.product.sameDayShipping}
              </span>
              <span className="flex items-center gap-1 text-lego-red">
                <span>🏪</span>
                {t.product.pickupInStore}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

