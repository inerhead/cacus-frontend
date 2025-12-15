'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/lib/api/products';
import appSettings from '@/config/settings';

interface HomeContentProps {
  displayProducts: Product[];
}

export default function HomeContent({ displayProducts }: HomeContentProps) {
  const t = useTranslation();

  const categoryIcons = [
    { label: t.categories.offers, icon: '🔧', href: '/ofertas' },
    { label: t.categories.combos, icon: '🌱', href: '/combos' },
    { label: t.categories.gifts, icon: '🎁', href: '/regalos' },
    { label: t.categories.new, icon: '🎮', href: '/nuevos' },
    { label: t.categories.stem, icon: '🔬', href: '/stem' },
  ];

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-lego-blue-light to-lego-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 uppercase">
            {t.home.heroTitle}
          </h1>
          <h2 className="text-3xl font-bold mb-6">
            {t.home.heroSubtitle}
          </h2>
          <Link href="/productos" className="btn-lego-black inline-block">
            {t.home.viewCatalog}
          </Link>
        </div>
      </section>

      {/* Category Icons */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-5 gap-4">
            {categoryIcons.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                className="flex flex-col items-center gap-2 hover:scale-105 transition-transform"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  {category.icon}
                </div>
                <span className="text-xs font-semibold text-center text-black">
                  {category.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-black mb-8 text-center uppercase">
            {t.home.featuredTitle}
          </h2>

          {displayProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayProducts.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    imageUrl={product.imageUrl}
                    isNew={product.isNew}
                    hasFreeShipping={product.price >= appSettings.shipping.freeShippingThreshold}
                  />
                ))}
              </div>

              <div className="text-center mt-8">
                <Link href="/productos" className="btn-lego">
                  {t.home.viewMore}
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                {t.home.noProducts}
              </p>
              <Link href="/productos" className="btn-lego">
                {t.home.viewCatalog}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-lego-blue text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t.home.newsletterTitle}
          </h2>
          <p className="text-lg mb-6">
            {t.home.newsletterText}
          </p>
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder={t.home.newsletterPlaceholder}
              className="flex-1 px-4 py-3 text-black rounded-none focus:outline-none focus:ring-2 focus:ring-lego-yellow"
            />
            <button type="submit" className="btn-lego">
              {t.home.register}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
