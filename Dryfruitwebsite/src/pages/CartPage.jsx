import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Truck, Shield, Tag, Phone, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, totalPrice, totalItems, updateQuantity, removeItem, clearCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const shipping = totalPrice >= 5000 ? 0 : 250;
  const grandTotal = totalPrice + shipping;

  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    let message = "Assalam o Alaikum! Mujhe ye dry fruits order karne hain:\n\n";
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.weight}) x ${item.quantity} = Rs. ${(item.price * item.quantity).toLocaleString()}\n`;
    });
    message += `\n-------------------\n`;
    message += `Total Items: ${totalItems}\n`;
    message += `Subtotal: Rs. ${totalPrice.toLocaleString()}\n`;
    message += `Delivery: ${shipping === 0 ? 'FREE' : `Rs. ${shipping}`}\n`;
    message += `Grand Total: Rs. ${grandTotal.toLocaleString()}\n\n`;
    message += `Kindly confirm my order. Shukriya!`;
    return encodeURIComponent(message);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-28 h-28 bg-primary-light rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-14 h-14 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-dark mb-3">Aapka Cart Khali Hai</h1>
            <p className="text-text-gray mb-8 max-w-md text-lg">
              Abhi tak koi product add nahi kiya. Humare premium dry fruits dekhein!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-deep transition-colors duration-200 text-lg shadow-lg shadow-primary/20"
            >
              <ArrowLeft className="w-5 h-5" />
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
            <h1 className="text-3xl md:text-4xl font-bold text-text-dark">Aapka Cart</h1>
            <p className="text-text-gray mt-1 text-lg">{totalItems} {totalItems === 1 ? 'item' : 'items'} cart mein</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-deep transition-colors duration-200 font-semibold"
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
                key={`${item.id}-${item.weight}`} 
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-border"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-primary-soft to-gold-light/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl md:text-5xl">{item.emoji || '🥜'}</span>
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-text-dark line-clamp-1">{item.name}</h3>
                        <p className="text-text-gray">Weight: <span className="font-medium text-primary">{item.weight}</span></p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.weight)}
                        className="p-2 text-text-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        aria-label="Hatayein"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border-2 border-primary/20 rounded-xl overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                          className="p-3 hover:bg-primary-light transition-colors duration-200"
                          aria-label="Kam karein"
                        >
                          <Minus className="w-4 h-4 text-primary" />
                        </button>
                        <span className="px-5 py-2 text-lg font-bold text-text-dark min-w-[4rem] text-center bg-primary-soft/30">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                          className="p-3 hover:bg-primary-light transition-colors duration-200"
                          aria-label="Zyada karein"
                        >
                          <Plus className="w-4 h-4 text-primary" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm text-text-gray">Rs. {item.price.toLocaleString()} x {item.quantity}</p>
                        <p className="text-xl font-bold text-primary">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-sm text-text-gray hover:text-red-500 transition-colors duration-200 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Sab Hatayein
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-text-dark mb-6">Order Summary</h2>

              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-text-gray">Subtotal ({totalItems} items)</span>
                  <span className="text-text-dark font-semibold">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-text-gray">Delivery</span>
                  {shipping === 0 ? (
                    <span className="text-success font-semibold">FREE</span>
                  ) : (
                    <span className="text-text-dark font-semibold">Rs. {shipping.toLocaleString()}</span>
                  )}
                </div>
                {shipping > 0 && (
                  <div className="bg-gold-light rounded-xl p-4 flex items-start gap-3">
                    <Truck className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-primary-deep">
                      <span className="font-semibold">Rs. {(5000 - totalPrice).toLocaleString()}</span> aur add karein FREE delivery ke liye!
                    </p>
                  </div>
                )}
                <div className="border-t-2 border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-text-dark text-xl">Total</span>
                    <span className="font-bold text-primary text-2xl">Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Order Button - Primary CTA */}
              <a
                href={`https://wa.me/923211234567?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-4 bg-whatsapp text-white font-bold rounded-xl hover:bg-green-600 transition-all duration-200 text-lg shadow-lg shadow-whatsapp/20 mb-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp pe Order Karein
              </a>

              {/* Call Button */}
              <a
                href="tel:+923211234567"
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-light text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
              >
                <Phone className="w-5 h-5" />
                Call Karein: 0321-1234567
              </a>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-dark text-sm">100% Original Products</p>
                      <p className="text-xs text-text-gray">Quality guaranteed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-dark text-sm">Fast Delivery</p>
                      <p className="text-xs text-text-gray">2-3 days mein delivery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold-light rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-accent-gold" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-dark text-sm">Cash on Delivery</p>
                      <p className="text-xs text-text-gray">Payment on delivery</p>
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
