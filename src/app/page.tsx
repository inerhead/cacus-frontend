import { productsAPI } from '@/lib/api/products';
import appSettings from '@/config/settings';
import HomeContent from '@/components/home/HomeContent';

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

export default async function Home() {
  const [featuredProducts, newProducts] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
  ]);

  // Use new products if featured products are empty
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : newProducts;

  return <HomeContent displayProducts={displayProducts} />;
}
