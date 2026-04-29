import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  // Dashboard ke liye sirf featured/best seller products dikhao
  const featuredProducts = products
    .filter(product => product.badge === 'Best Seller')
    .slice(0, 6);

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  const handleOrderNow = () => {
    navigate('/products');
  };

  return (
    <>
      <Hero />
      
      {/* Featured Products Section - Dashboard Style */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-brown-900 mb-2">
                Featured Products
              </h2>
              <p className="text-brown-600">
                Humare best selling aur premium quality products
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleOrderNow}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-deep transition-colors shadow-lg shadow-primary/20"
              >
                Order Now
              </button>
              <button
                onClick={handleViewAllProducts}
                className="flex items-center gap-2 px-6 py-3 bg-brown-600 text-white rounded-lg font-semibold hover:bg-brown-700 transition-colors"
              >
                View All Products
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>

          {/* View All Button for Mobile */}
          <div className="mt-8 text-center lg:hidden">
            <button
              onClick={handleViewAllProducts}
              className="inline-flex items-center gap-2 px-8 py-3 bg-brown-600 text-white rounded-lg font-semibold hover:bg-brown-700 transition-colors"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <AboutSection />
      <ContactSection />
    </>
  );
}
