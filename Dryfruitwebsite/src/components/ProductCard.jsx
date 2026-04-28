import { useState } from 'react';
import { ShoppingCart, Check, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onProductClick }) {
  const [selectedWeight, setSelectedWeight] = useState(product.weightOptions[0]);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Stock Khatam', className: 'bg-red-50 text-red-600 border-red-200' };
    if (stock <= 10) return { text: 'Sirf ' + stock + ' Bache', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { text: 'Available', className: 'bg-green-50 text-green-700 border-green-200' };
  };

  const stockStatus = getStockStatus(product.stock);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    
    addItem(product, selectedWeight);
    setIsAdded(true);
    
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex items-center gap-4 p-4 border-l-4 border-success`}
      >
        <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-success" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-text-dark">Cart mein add ho gaya!</p>
          <p className="text-sm text-text-gray">
            {product.name} - {selectedWeight}
          </p>
        </div>
      </div>
    ), { duration: 2000 });

    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div
      onClick={() => onProductClick(product)}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border group"
    >
      {/* Image Area */}
      <div className="relative h-[200px] bg-gradient-to-br from-primary-soft to-gold-light/50 p-4 flex items-center justify-center">
        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-3 py-1.5 text-xs font-bold rounded-full ${
              product.badge === 'Best Seller'
                ? 'bg-accent-gold text-white'
                : 'bg-primary text-white'
            }`}
          >
            {product.badge === 'Best Seller' ? 'Bestseller' : product.badge}
          </span>
        )}
        
        {/* Product Emoji/Image */}
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {product.emoji || '🥜'}
        </div>
        
        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-3.5 h-3.5 text-accent-gold fill-accent-gold" />
          <span className="text-xs font-semibold text-text-dark">{product.rating}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-lg text-text-dark mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-text-gray">{product.origin}</p>
        </div>

        {/* Weight Options */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.weightOptions.map((weight) => (
            <button
              key={weight}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWeight(weight);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                selectedWeight === weight
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-primary-soft text-primary hover:bg-primary-light border border-transparent'
              }`}
            >
              {weight}
            </button>
          ))}
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-primary">
              Rs. {product.pricePerWeight[selectedWeight].toLocaleString()}
            </span>
          </div>
          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${stockStatus.className}`}>
            {stockStatus.text}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
            product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isAdded
              ? 'bg-success text-white'
              : 'bg-primary text-white hover:bg-primary-deep shadow-lg shadow-primary/20 hover:shadow-xl'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5" />
              Add Ho Gaya!
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Cart Mein Dalein
            </>
          )}
        </button>
      </div>
    </div>
  );
}
