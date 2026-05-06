import { useState, useMemo } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { products, categories } from '../data/products';
import ProductCard from './ProductCard';
import { useReducedMotion } from '../hooks/useReducedMotion';

const categoryEmojis = {
  'All': '🛒',
  'Almonds': '🥜',
  'Cashews': '🥜',
  'Walnuts': '🌰',
  'Pistachios': '🥜',
  'Dates': '🌴',
  'Raisins': '🍇',
  'Spices': '🌿'
};

export default function ProductsSection({ searchQuery, onProductClick }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const [headerRef, headerInView] = useInView({
    threshold: 0.15,
    triggerOnce: true
  });

  const sortOptions = [
    { value: 'featured', label: 'Popular' },
    { value: 'price-low', label: 'Sasta Pehle' },
    { value: 'price-high', label: 'Mehenga Pehle' },
    { value: 'rating', label: 'Top Rated' },
  ];

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.origin.toLowerCase().includes(query) ||
          (p.nameUrdu && p.nameUrdu.includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort(
          (a, b) => a.pricePerWeight[a.weightOptions[0]] - b.pricePerWeight[b.weightOptions[0]]
        );
        break;
      case 'price-high':
        filtered = [...filtered].sort(
          (a, b) => b.pricePerWeight[b.weightOptions[0]] - a.pricePerWeight[a.weightOptions[0]]
        );
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return filtered;
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <section id="products" className="bg-cream py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          ref={headerRef}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
          animate={headerInView && !prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-3">Humare Products</h2>
          <p className="text-text-gray text-lg max-w-2xl mx-auto">
            Premium quality dry fruits aur spices - Direct import kiye gaye best farms se
          </p>
        </motion.div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white border border-border text-text-dark hover:border-primary hover:text-primary'
                }`}
              >
                <span>{categoryEmojis[category]}</span>
                {category === 'All' ? 'Sab Dekhein' : category}
              </motion.button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-text-dark font-medium hover:border-primary transition-colors duration-200"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {sortOptions.find((o) => o.value === sortBy)?.label}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-xl z-10 overflow-hidden">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-primary-soft transition-colors duration-200 ${
                      sortBy === option.value ? 'text-primary font-semibold bg-primary-soft' : 'text-text-dark'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-text-gray">
            <span className="font-semibold text-text-dark">{filteredProducts.length}</span> products mil gaye
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-text-dark mb-2">Koi product nahi mila</h3>
            <p className="text-text-gray">Koi aur category ya search try karein</p>
          </div>
        )}
      </div>
    </section>
  );
}
