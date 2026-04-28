import { useState } from 'react';
import { X, Star, Minus, Plus, ShoppingCart, Truck, Check, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductModal({ product, isOpen, onClose }) {
  const [selectedWeight, setSelectedWeight] = useState(product?.weightOptions[0] || '');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedWeight);
    }
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
            {quantity}x {product.name} - {selectedWeight}
          </p>
        </div>
      </div>
    ), { duration: 2000 });
    onClose();
  };

  const handleWhatsAppOrder = () => {
    const message = `Assalam o Alaikum!\n\nMujhe ye product order karna hai:\n\nProduct: ${product.name}\nWeight: ${selectedWeight}\nQuantity: ${quantity}\nPrice: Rs. ${(product.pricePerWeight[selectedWeight] * quantity).toLocaleString()}\n\nKindly confirm karein. Shukriya!`;
    window.open(`https://wa.me/923211234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Stock Khatam', className: 'bg-red-50 text-red-600 border-red-200' };
    if (stock <= 10) return { text: 'Sirf ' + stock + ' Bache', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { text: 'Available', className: 'bg-green-50 text-green-700 border-green-200' };
  };

  const stockStatus = getStockStatus(product.stock);
  const totalPrice = product.pricePerWeight[selectedWeight] * quantity;
  const originalTotal = product.originalPrice[selectedWeight] * quantity;
  const discount = Math.round(((originalTotal - totalPrice) / originalTotal) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white shadow-lg hover:bg-primary-light transition-colors duration-200 z-10"
          >
            <X className="w-5 h-5 text-text-dark" />
          </button>

          <div className="grid md:grid-cols-2">
            {/* Left Column - Image */}
            <div className="relative bg-gradient-to-br from-primary-soft to-gold-light/50 p-8 md:p-12 flex items-center justify-center rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
              {product.badge && (
                <span className={`absolute top-4 left-4 px-4 py-2 text-sm font-bold rounded-full ${
                  product.badge === 'Best Seller'
                    ? 'bg-accent-gold text-white'
                    : 'bg-primary text-white'
                }`}>
                  {product.badge === 'Best Seller' ? 'Bestseller' : product.badge}
                </span>
              )}
              
              <div className="text-[120px] md:text-[160px]">
                {product.emoji || '🥜'}
              </div>

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute bottom-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="p-6 md:p-8">
              {/* Category */}
              <p className="text-primary text-sm font-semibold mb-2 uppercase tracking-wide">
                {product.category}
              </p>

              {/* Product Name */}
              <h2 className="text-2xl md:text-3xl font-bold text-text-dark mb-2">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(product.rating)
                          ? 'fill-accent-gold text-accent-gold'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-text-gray text-sm">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">
                  Rs. {totalPrice.toLocaleString()}
                </span>
                <span className="text-lg text-text-gray line-through">
                  Rs. {originalTotal.toLocaleString()}
                </span>
              </div>

              {/* Stock Status */}
              <div className="mb-5">
                <span className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-full border ${stockStatus.className}`}>
                  {stockStatus.text}
                </span>
              </div>

              {/* Description */}
              <p className="text-text-gray leading-relaxed mb-6 text-sm">
                {product.description}
              </p>

              {/* Weight Selector */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-text-dark mb-3">
                  Weight Chunein
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.weightOptions.map((weight) => (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                        selectedWeight === weight
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-primary-soft text-primary hover:bg-primary-light'
                      }`}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-text-dark mb-3">
                  Quantity
                </label>
                <div className="inline-flex items-center border-2 border-primary/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-primary-light transition-colors duration-200"
                  >
                    <Minus className="w-5 h-5 text-primary" />
                  </button>
                  <span className="px-6 py-2 text-xl font-bold text-text-dark min-w-[4rem] text-center bg-primary-soft/30">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-primary-light transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-deep shadow-lg shadow-primary/20'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Cart Mein Dalein
                </button>
                <button
                  onClick={handleWhatsAppOrder}
                  disabled={product.stock === 0}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-whatsapp text-white hover:bg-green-600 shadow-lg shadow-whatsapp/20'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp pe Order Karein
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-text-gray">Free Delivery 5000+</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-text-gray">100% Original</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-text-gray">Origin:</span>
                    <span className="ml-1 text-text-dark font-medium">{product.origin}</span>
                  </div>
                  <div>
                    <span className="text-text-gray">Shelf Life:</span>
                    <span className="ml-1 text-text-dark font-medium">{product.shelfLife}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
