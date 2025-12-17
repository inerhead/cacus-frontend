import { productsAPI } from '@/lib/api/products';
import appSettings from '@/config/settings';
import HomeContent from '@/components/home/HomeContent';

// Revalidate every 10 seconds to reflect admin changes quickly
export const revalidate = 10;

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

async function getHeroContent() {
  try {
    // En servidor usar la URL interna de Docker, en cliente usar la pública
    const apiUrl = typeof window === 'undefined' 
      ? 'http://backend:3000/api' // URL interna de Docker para server-side
      : process.env.NEXT_PUBLIC_API_URL; // URL pública para client-side
      
    const response = await fetch(
      `${apiUrl}/settings/content/home-hero`,
      { cache: 'no-store' }
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching hero content:', error);
  }
  return null;
}

export default async function Home() {
  const [featuredProducts, newProducts, heroContent] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
    getHeroContent(),
  ]);

  // Use new products if featured products are empty
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : newProducts;

  return <HomeContent displayProducts={displayProducts} initialHeroContent={heroContent} />;
}
