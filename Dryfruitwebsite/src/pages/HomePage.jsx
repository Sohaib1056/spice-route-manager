import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            <button
              onClick={handleViewAllProducts}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-brown-600 text-white rounded-lg font-semibold hover:bg-brown-700 transition-colors"
            >
              Explore More
              <ArrowRight className="w-5 h-5" />
            </button>
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

          {/* View More Button for all screens */}
          <div className="mt-12 text-center">
            <button
              onClick={handleViewAllProducts}
              className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-primary transition-all duration-300 shadow-xl shadow-slate-200"
            >
              Explore More Products
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
