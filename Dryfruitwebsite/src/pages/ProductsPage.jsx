import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/products';
import { Filter, Search, X } from 'lucide-react';

export default function ProductsPage({ searchQuery: externalSearchQuery = '' }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  // Combine external and local search
  const effectiveSearchQuery = localSearchQuery || externalSearchQuery;

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
                         product.nameUrdu.includes(effectiveSearchQuery) ||
                         product.category.toLowerCase().includes(effectiveSearchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.pricePerWeight['250g'] - b.pricePerWeight['250g'];
      case 'price-high':
        return b.pricePerWeight['250g'] - a.pricePerWeight['250g'];
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Bar: Search & Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Our Products
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Premium Selection ({sortedProducts.length})
            </p>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {localSearchQuery && (
              <button 
                onClick={() => setLocalSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Filter className="w-3 h-3" /> Categories
              </h3>
              <div className="flex flex-col gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-[1.02]'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {category}
                    {selectedCategory === category && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center lg:text-left">
                Sort Results
              </h3>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs font-black uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer appearance-none"
                >
                  <option value="featured">Featured Items</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name: A to Z</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/10 transition-all" />
              <h4 className="text-sm font-black uppercase tracking-wider mb-2 relative z-10">Need Help?</h4>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed mb-4 relative z-10">Contact our experts for bulk orders and recommendations.</p>
              <a href="#contact" className="inline-block w-full text-center bg-amber-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-amber-600 transition-colors relative z-10">
                Contact Us
              </a>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  No products found
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
