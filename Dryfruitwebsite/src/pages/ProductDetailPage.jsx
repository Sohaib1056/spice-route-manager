import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Package, 
  Truck, 
  Shield, 
  ArrowLeft,
  Plus,
  Minus,
  MapPin,
  Clock,
  Info,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const product = products.find(p => p.id === parseInt(id));
  const [selectedWeight, setSelectedWeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product && product.weightOptions.length > 0) {
      setSelectedWeight(product.weightOptions[0]);
    }
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-primary font-black uppercase tracking-widest text-sm hover:underline"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = product.pricePerWeight?.[selectedWeight] || 0;
  const originalPrice = product.originalPrice?.[selectedWeight] || 0;
  const discount = originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    
    addItem(product, selectedWeight, quantity);
    setIsAdded(true);
    
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex items-center gap-4 p-5 border-l-4 border-green-500`}
      >
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6 text-green-600 stroke-[3px]" />
        </div>
        <div className="flex-1">
          <p className="font-black text-slate-900 uppercase text-xs tracking-wider">Added to Cart!</p>
          <p className="text-sm text-slate-500 font-bold mt-0.5">
            {product.name} ({selectedWeight}) x {quantity}
          </p>
        </div>
      </div>
    ), { duration: 2500 });

    setTimeout(() => setIsAdded(false), 2500);
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-100/80 py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Main Product Container - More Compact */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-300/40 overflow-hidden border border-slate-200 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Visual Section - Reduced Padding */}
            <div className="relative flex items-center justify-center bg-slate-100/30 p-8 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mt-32 blur-[80px]" />
              
              <div className="relative z-10 text-center transform transition-all duration-700 hover:scale-105">
                <div className="text-[8rem] md:text-[10rem] drop-shadow-xl filter saturate-[1.1]">
                  {product.emoji}
                </div>
                {product.badge && (
                  <div className="mt-6">
                    <span className="inline-block px-5 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Info Section - Optimized Spacing */}
            <div className="p-6 lg:p-10 flex flex-col bg-white">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary/10">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                    <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                    <span className="text-[10px] font-black text-amber-800">{product.rating}</span>
                  </div>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase leading-tight mb-1">
                  {product.name}
                </h1>
                <p className="text-xl text-slate-400 font-urdu mb-3">{product.nameUrdu}</p>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <MapPin className="w-3 h-3" />
                  Sourced from {product.origin}
                </div>
              </div>

              {/* Price & Offers - Slimmer */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    Rs. {(currentPrice || 0).toLocaleString()}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-base text-slate-300 line-through font-bold">
                      Rs. {(originalPrice || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-auto px-3 py-1 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md">
                    {discount}% OFF
                  </div>
                </div>
              </div>

              {/* Selection Options - Compact */}
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                    Choose Weight
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.weightOptions.map((weight) => (
                      <button
                        key={weight}
                        onClick={() => setSelectedWeight(weight)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border-2 ${
                          selectedWeight === weight
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-900 hover:text-slate-900'
                        }`}
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                    Select Quantity
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
                      <button
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        className="p-2.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-all hover:bg-white rounded-lg"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4 stroke-[3px]" />
                      </button>
                      <span className="w-10 text-center text-lg font-black text-slate-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                        className="p-2.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-all hover:bg-white rounded-lg"
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="w-4 h-4 stroke-[3px]" />
                      </button>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {product.stock} units left
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Optimized Size */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-[4] flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] transition-all duration-300 shadow-xl active:scale-[0.98] ${
                    product.stock === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                      : isAdded
                      ? 'bg-green-600 text-white'
                      : 'bg-primary text-white hover:bg-primary-deep shadow-primary/30'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5 stroke-[4px]" />
                      Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 stroke-[2.5px]" />
                      Add to Cart
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex-1 flex items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 active:scale-90 ${
                    isFavorite
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-slate-100 bg-slate-100 text-slate-400 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isFavorite ? 'fill-red-500 scale-110' : 'scale-100'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Story & Info Grid - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/40">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Product Story</h3>
              <p className="text-lg text-slate-700 font-medium leading-relaxed italic">
                "{product.description}"
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Shelf Life</h4>
                  <p className="text-xs text-slate-500 font-bold">{product.shelfLife}</p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Storage</h4>
                  <p className="text-xs text-slate-500 font-bold">{product.storageInfo}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">Shipping & Trust</h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                <Truck className="w-6 h-6 text-amber-400" />
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Fast Delivery</h4>
                  <p className="text-xs text-white/60 font-bold">2-4 Business Days</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <Shield className="w-6 h-6 text-amber-400" />
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest">100% Authentic</h4>
                  <p className="text-xs text-white/60 font-bold">Direct Sourced</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                Free delivery on orders over <span className="text-amber-400 font-black">Rs. 2,000</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-slate-200 pt-16">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">More from</h3>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{product.category}</h2>
              </div>
              <button 
                onClick={() => navigate('/products')}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <div
                  key={rp.id}
                  onClick={() => navigate(`/product/${rp.id}`)}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group text-center"
                >
                  <div className="text-6xl mb-4 transform transition-transform group-hover:scale-110">{rp.emoji}</div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-primary transition-colors">{rp.name}</h4>
                  <div className="mt-2 text-xs font-black text-slate-400">
                    Rs. {rp.pricePerWeight[rp.weightOptions[0]].toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
