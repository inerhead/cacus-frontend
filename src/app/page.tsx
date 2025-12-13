import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { productsAPI, Product } from '@/lib/api/products';
import appSettings from '@/config/settings';

async function getFeaturedProducts() {
  try {
    const response = await productsAPI.getFeatured({ 
      limit: appSettings.home.maxFeaturedProducts 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

async function getNewProducts() {
  try {
    const response = await productsAPI.getNew({ 
      limit: appSettings.home.maxNewProducts 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching new products:', error);
    return [];
  }
}

const categoryIcons = [
  { label: 'Ofertas', icon: '🔧', href: '/ofertas' },
  { label: 'Combos', icon: '🌱', href: '/combos' },
  { label: 'Regalos', icon: '🎁', href: '/regalos' },
  { label: 'Novedades', icon: '🎮', href: '/nuevos' },
  { label: 'STEM', icon: '🔬', href: '/stem' },
];

export default async function Home() {
  const [featuredProducts, newProducts] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
  ]);

  // Use new products if featured products are empty
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : newProducts;

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-lego-blue-light to-lego-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 uppercase">
            SORPRENDE EN ESTA NAVIDAD
          </h1>
          <h2 className="text-3xl font-bold mb-6">
            CON NUESTRAS NOVEDADES
          </h2>
          <Link href="/productos" className="btn-lego-black inline-block">
            Ver Catálogo Completo
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
            SORPRENDE EN ESTA NAVIDAD CON NUESTRAS NOVEDADES
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
                  Ver Más
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                No hay productos disponibles en este momento.
              </p>
              <Link href="/productos" className="btn-lego">
                Ver Catálogo
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-lego-blue text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¡Suscríbete a nuestro boletín!
          </h2>
          <p className="text-lg mb-6">
            Los secretos de las construcciones más extraordinarias te están esperando.
          </p>
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Dirección de correo electrónico"
              className="flex-1 px-4 py-3 text-black rounded-none focus:outline-none focus:ring-2 focus:ring-lego-yellow"
            />
            <button type="submit" className="btn-lego">
              Registrarse
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
