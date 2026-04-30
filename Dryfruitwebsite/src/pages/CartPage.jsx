import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Truck, Shield, CheckCircle, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, updateQuantity, removeItem, clearCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const shipping = totalPrice >= 5000 ? 0 : 250;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-32 h-32 bg-primary-light rounded-full flex items-center justify-center mb-6 animate-pulse">
              <ShoppingBag className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-3">Aapka Cart Khali Hai</h1>
            <p className="text-text-gray mb-8 max-w-md text-lg">
              Abhi tak koi product add nahi kiya. Humare premium dry fruits dekhein aur shopping shuru karein!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-deep transition-all duration-200 text-lg shadow-lg shadow-primary/20 hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-1">Shopping Cart</h1>
            <p className="text-text-gray text-lg">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} aapke cart mein
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-deep transition-colors duration-200 font-semibold text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div 
                key={`${item.id}-${item.selectedWeight}`} 
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-border hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary-soft to-gold-light/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-5xl md:text-6xl">{item.emoji || '🥜'}</span>
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg md:text-xl text-text-dark mb-1">{item.name}</h3>
                        <p className="text-sm text-text-gray mb-1">{item.nameUrdu}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-gray">Weight:</span>
                          <span className="px-3 py-1 bg-primary-light text-primary text-sm font-semibold rounded-full">
                            {item.selectedWeight}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.selectedWeight)}
                        className="p-2 text-text-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border-2 border-primary/20 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedWeight, item.quantity - 1)}
                          className="p-3 hover:bg-primary-light transition-colors duration-200"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 text-primary" />
                        </button>
                        <span className="px-6 py-2 text-lg font-bold text-text-dark min-w-[5rem] text-center bg-primary-soft/30">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedWeight, item.quantity + 1)}
                          className="p-3 hover:bg-primary-light transition-colors duration-200"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 text-primary" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm text-text-gray mb-1">
                          Rs. {item.price.toLocaleString()} × {item.quantity}
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-primary">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  if (window.confirm('Kya aap sach mein sab items hatana chahte hain?')) {
                    clearCart();
                    toast.success('Cart khali kar diya gaya');
                  }
                }}
                className="text-sm text-text-gray hover:text-red-500 transition-colors duration-200 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-border p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-text-dark mb-6">Order Summary</h2>

              {/* Summary Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-base">
                  <span className="text-text-gray">Subtotal ({totalItems} items)</span>
                  <span className="text-text-dark font-semibold">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-text-gray">Delivery Charges</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-bold">FREE</span>
                  ) : (
                    <span className="text-text-dark font-semibold">Rs. {shipping.toLocaleString()}</span>
                  )}
                </div>
                {shipping > 0 && (
                  <div className="bg-gradient-to-r from-gold-light to-primary-light rounded-xl p-4 flex items-start gap-3">
                    <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-primary-deep">
                      Sirf <span className="font-bold">Rs. {(5000 - totalPrice).toLocaleString()}</span> aur add karein aur <span className="font-bold">FREE delivery</span> hasil karein!
                    </p>
                  </div>
                )}
                <div className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-text-dark text-xl">Grand Total</span>
                    <span className="font-bold text-primary text-2xl">Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-deep transition-all duration-200 text-lg shadow-lg shadow-primary/20 hover:scale-105"
              >
                <ShoppingBag className="w-6 h-6" />
                Proceed to Checkout
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-dark text-sm">100% Original Products</p>
                      <p className="text-xs text-text-gray">Quality guaranteed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-dark text-sm">Fast Delivery</p>
                      <p className="text-xs text-text-gray">2-4 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-dark text-sm">Secure Payment</p>
                      <p className="text-xs text-text-gray">COD & Online available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
