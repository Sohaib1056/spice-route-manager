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
        
        {/* Product Logo/Emoji */}
        <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
          {product.emoji || '🥜'}
        </div>
        
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
        <div className="flex flex-wrap gap-1 mb-4">
          {product.weightOptions.map((weight) => (
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
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between mt-auto mb-4 pt-2 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Price</span>
            <span className="text-base font-black text-slate-900 leading-none">
              Rs. {product.pricePerWeight[selectedWeight].toLocaleString()}
            </span>
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
