import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Check, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BASE_URL } from '../services/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onProductClick = () => {} }) {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  // Handle card click safely
  const handleCardClick = () => {
    if (typeof onProductClick === 'function') {
      onProductClick(product);
    }
  };

  // Robust parsing of weight options
  const weightOptions = useMemo(() => {
    if (!product || !product.weightOptions) return [];
    if (Array.isArray(product.weightOptions)) {
      // Check if it's an array with a single comma-separated string
      if (product.weightOptions.length === 1 && typeof product.weightOptions[0] === 'string' && product.weightOptions[0].includes(',')) {
        return product.weightOptions[0].split(',').map(w => w.trim()).filter(Boolean);
      }
      return product.weightOptions.filter(Boolean);
    }
    if (typeof product.weightOptions === 'string') {
      return product.weightOptions.split(',').map(w => w.trim()).filter(Boolean);
    }
    return [];
  }, [product?.weightOptions]);

  const [selectedWeight, setSelectedWeight] = useState(
    weightOptions.length > 0 ? weightOptions[0] : ''
  );

  useEffect(() => {
    if (weightOptions.length > 0 && !selectedWeight) {
      setSelectedWeight(weightOptions[0]);
    }
  }, [weightOptions, selectedWeight]);

  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: 'Stock Khatam', className: 'bg-red-50 text-red-600 border-red-200', isLow: true };
    if (stock <= (product.minStock || 5)) return { text: `${stock} kg Bache`, className: 'bg-amber-50 text-amber-700 border-amber-200', isLow: true };
    return { text: `${stock} kg Available`, className: 'bg-green-50 text-green-700 border-green-200', isLow: false };
  };

  const stockStatus = getStockStatus(product.stock);

  const isDiscountEligible = (weight) => {
    return product.discountPercentage > 0;
  };

  const calculatePriceForWeight = (weight, basePricePerKg) => {
    const w = weight.toLowerCase();
    let multiplier = 1;
    
    if (w.includes('250g') || w.includes('250 g')) multiplier = 0.25;
    else if (w.includes('500g') || w.includes('500 g')) multiplier = 0.5;
    else if (w.includes('750g') || w.includes('750 g')) multiplier = 0.75;
    else if (w.includes('1kg') || w.includes('1000g') || w.includes('1 kg')) multiplier = 1;
    
    return Math.round(basePricePerKg * multiplier);
  };

  const basePrice = product.sellPrice || 0;
  const hasDiscount = product.discountPercentage > 0;
  
  // Calculate the original (before discount) base price
  const originalBasePrice = hasDiscount 
    ? Math.round(basePrice / (1 - product.discountPercentage / 100))
    : basePrice;

  const currentPrice = calculatePriceForWeight(selectedWeight, basePrice);
  const originalPriceCalculated = calculatePriceForWeight(selectedWeight, originalBasePrice);
  
  const displayPrice = currentPrice;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error("Stock khatam ho gaya hai!");
      return;
    }
    
    // Check if adding this would exceed stock (simplified check here, more robust in Context)
    // We assume 1kg base for multiplier check
    const weightInKg = currentPrice / basePrice;
    if (weightInKg > product.stock) {
      toast.error(`Maazrat! Sirf ${product.stock}kg stock bacha hai.`);
      return;
    }
    
    // Create a copy of product with the calculated price for the cart
    const productWithCalculatedPrice = {
      ...product,
      pricePerWeight: {
        ...product.pricePerWeight,
        [selectedWeight]: displayPrice
      }
    };
    
    addItem(productWithCalculatedPrice, selectedWeight);
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
      onClick={handleCardClick}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl border border-slate-200 group flex flex-col h-full min-h-[380px]"
    >
      {/* Image Area */}
      <div className="relative h-[140px] md:h-[160px] bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
        {product.badge && (
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md z-10 ${
              product.badge === 'Best Seller'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-800 text-white'
            }`}
          >
            {product.badge}
          </span>
        )}

        {product.discountPercentage > 0 && isDiscountEligible(selectedWeight) && (
          <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md z-10 shadow-sm animate-pulse">
            {product.discountPercentage}% OFF
          </span>
        )}
        
        {/* Product Image or Emoji */}
        {product.image ? (
          <img 
            src={product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
            {product.emoji || '🥜'}
          </div>
        )}
        
        {/* Rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-slate-100">
          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
          <span className="text-[10px] font-bold text-slate-700">{product.rating}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <h3 className="font-bold text-slate-900 text-sm mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            {product.origin}
          </p>
        </div>

        {/* Weight Selection */}
        <div className="flex flex-wrap gap-1 mb-4 min-h-[32px]">
          {weightOptions.map((weight) => (
            <button
              key={weight}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWeight(weight);
              }}
              className={`px-2 py-1 text-[10px] font-black rounded transition-all ${
                selectedWeight === weight
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {weight}
            </button>
          ))}
          {weightOptions.length === 0 && (
            <span className="text-[10px] text-slate-400 italic">No weight options</span>
          )}
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between mt-auto mb-4 pt-2 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Price</span>
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[10px] text-slate-400 line-through decoration-red-400/50">
                  Rs. {originalPriceCalculated.toLocaleString()}
                </span>
              )}
              <span className="text-base font-black text-slate-900 leading-none">
                Rs. {displayPrice.toLocaleString()}
              </span>
            </div>
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${stockStatus.className}`}>
            {stockStatus.text}
          </span>
        </div>

        {/* Action Button - High Visibility */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-black uppercase tracking-widest text-xs transition-all shadow-md active:scale-95 ${
            product.stock === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              : isAdded
              ? 'bg-green-600 text-white shadow-green-200'
              : 'bg-primary text-white hover:bg-primary-deep shadow-primary/20'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3px]" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5px]" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
