import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Home, 
  CreditCard, 
  Truck, 
  Shield, 
  CheckCircle,
  Package,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    
    // Shipping Address
    address: '',
    apartment: '',
    city: '',
    province: '',
    postalCode: '',
    
    // Payment & Delivery
    paymentMethod: 'cod',
    deliveryNotes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Add scroll to top on success
  useEffect(() => {
    if (orderSuccess) {
      window.scrollTo(0, 0);
    }
  }, [orderSuccess]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // If cart is empty AND order was not successful, redirect to cart page
    if (items.length === 0 && !orderSuccess) {
      navigate('/cart');
      toast.error('Aapka cart khali hai');
    }
  }, [items, navigate, orderSuccess]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Personal Information
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name zaruri hai';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name zaruri hai';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number zaruri hai';
    } else if (!/^(\+92|0)?[0-9]{10}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Valid phone number darj karein';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email address darj karein';
    }
    
    // Shipping Address
    if (!formData.address.trim()) {
      newErrors.address = 'Address zaruri hai';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City zaruri hai';
    }
    
    if (!formData.province.trim()) {
      newErrors.province = 'Province zaruri hai';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const shipping = totalPrice >= 5000 ? 0 : 250;
  const grandTotal = totalPrice + shipping;

  const generateWhatsAppMessage = () => {
    let message = "*🛍️ NEW ORDER RECEIVED!*\n\n";
    
    message += "*👤 CUSTOMER DETAILS:*\n";
    message += `Name: ${formData.firstName} ${formData.lastName}\n`;
    message += `📱 Phone: ${formData.phone}\n`;
    if (formData.email) message += `📧 Email: ${formData.email}\n`;
    
    message += `\n*📍 SHIPPING ADDRESS:*\n`;
    message += `${formData.address}\n`;
    if (formData.apartment) message += `${formData.apartment}\n`;
    message += `${formData.city}, ${formData.province}\n`;
    if (formData.postalCode) message += `Postal Code: ${formData.postalCode}\n`;
    
    message += `\n*🛒 ORDER ITEMS:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Weight: ${item.selectedWeight}\n`;
      message += `   Qty: ${item.quantity} × Rs. ${item.price.toLocaleString()}\n`;
      message += `   Subtotal: Rs. ${(item.price * item.quantity).toLocaleString()}\n\n`;
    });
    
    message += `*💰 PAYMENT SUMMARY:*\n`;
    message += `Subtotal: Rs. ${totalPrice.toLocaleString()}\n`;
    message += `Delivery: ${shipping === 0 ? 'FREE ✅' : `Rs. ${shipping}`}\n`;
    message += `*GRAND TOTAL: Rs. ${grandTotal.toLocaleString()}*\n\n`;
    
    message += `*💳 Payment Method:* ${formData.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}\n`;
    
    if (formData.deliveryNotes) {
      message += `\n*📝 Delivery Notes:*\n${formData.deliveryNotes}\n`;
    }
    
    message += `\n✅ *Please confirm this order. Thank you!*`;
    
    return encodeURIComponent(message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Meherbani kar ke tamam zaruri fields bharein');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare order data for backend
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email || undefined
        },
        shippingAddress: {
          address: formData.address,
          apartment: formData.apartment || undefined,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode || undefined
        },
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          nameUrdu: item.nameUrdu,
          emoji: item.emoji,
          selectedWeight: item.selectedWeight,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        subtotal: totalPrice,
        shippingCharges: shipping,
        total: grandTotal,
        paymentMethod: formData.paymentMethod,
        deliveryNotes: formData.deliveryNotes || undefined
      };

      // Save order to backend
      const response = await fetch('http://localhost:5000/api/website-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        setOrderNumber(result.data.orderNumber);
        setOrderSuccess(true);
        clearCart();
        window.scrollTo(0, 0);
      } else {
        throw new Error(result.message || 'Order creation failed');
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      toast.error(error.message || "Order place karne mein masla aaya. Dobara koshish karein.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const provinces = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Gilgit-Baltistan',
    'Azad Kashmir',
    'Islamabad Capital Territory'
  ];

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-enter">
          {/* Top Banner / Celebration */}
          <div className="h-4 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600" />
          
          <div className="p-10 md:p-14 text-center">
            {/* Animated Icon */}
            <div className="relative mb-10 inline-block">
              <div className="absolute inset-0 bg-green-100 rounded-full scale-150 animate-ping opacity-25" />
              <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
                <CheckCircle className="w-12 h-12 text-white stroke-[3px]" />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter italic">
              Order Received!
            </h2>
            
            <p className="text-slate-500 font-bold text-lg mb-8 leading-relaxed">
              Shukriya! Aapka order <span className="text-primary font-black px-2 py-1 bg-primary/5 rounded-lg">#{orderNumber}</span> humein mil gaya hai aur hum jald is par kaam shuru karenge.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 transition-all hover:bg-slate-100">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-5 h-5 text-green-600 fill-green-600" />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp Status</h4>
                <p className="text-xs text-slate-600 font-bold">Details ke liye WhatsApp karein</p>
              </div>
              <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 transition-all hover:bg-slate-100">
                <div className="w-10 h-10 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fast Delivery</h4>
                <p className="text-xs text-slate-600 font-bold">2-4 din mein aap tak!</p>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-4">
              <a
                href={`https://wa.me/923211234567?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-4 py-5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-2xl shadow-green-200 active:scale-95 text-base uppercase tracking-widest group"
              >
                <Phone className="w-6 h-6 fill-white group-hover:rotate-12 transition-transform" />
                WhatsApp Par Order Confirm Karein
              </a>
              
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 text-base uppercase tracking-widest"
              >
                <Home className="w-5 h-5" />
                OK - Dashboard Par Jayein
              </button>
            </div>

            <p className="mt-10 text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] animate-pulse">
              Apne Mobile Par WhatsApp Check Karein
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-primary-soft to-gold-light/30 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-deep transition-colors duration-200 font-semibold mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-2">Checkout</h1>
          <p className="text-text-gray text-lg">Complete your order details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side - Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-border p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-dark">Personal Information</h2>
                    <p className="text-sm text-text-gray">Apni personal details darj karein</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Ahmed"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-slate-50 border ${
                        errors.firstName ? 'border-red-500' : 'border-slate-200'
                      } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Khan"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-slate-50 border ${
                        errors.lastName ? 'border-red-500' : 'border-slate-200'
                      } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-gray" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="03XX-XXXXXXX"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                          errors.phone ? 'border-red-500' : 'border-slate-200'
                        } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      Email Address <span className="text-text-gray text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-gray" />
                      <input
                        type="email"
                        name="email"
                        placeholder="ahmed@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                          errors.email ? 'border-red-500' : 'border-slate-200'
                        } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-lg border border-border p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-dark">Shipping Address</h2>
                    <p className="text-sm text-text-gray">Delivery address darj karein</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 w-5 h-5 text-text-gray" />
                      <textarea
                        name="address"
                        placeholder="House # 123, Street 45, Block A"
                        required
                        rows="2"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                          errors.address ? 'border-red-500' : 'border-slate-200'
                        } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none`}
                      ></textarea>
                    </div>
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      Apartment, Suite, etc. <span className="text-text-gray text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      placeholder="Apartment 4B, Floor 2"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-text-dark mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        placeholder="Lahore"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-slate-50 border ${
                          errors.city ? 'border-red-500' : 'border-slate-200'
                        } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-dark mb-2">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="province"
                        required
                        value={formData.province}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-slate-50 border ${
                          errors.province ? 'border-red-500' : 'border-slate-200'
                        } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                      >
                        <option value="">Select Province</option>
                        {provinces.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                      {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      Postal Code <span className="text-text-gray text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="54000"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg border border-border p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-dark">Payment Method</h2>
                    <p className="text-sm text-text-gray">Apna payment method select karein</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      formData.paymentMethod === 'cod'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        formData.paymentMethod === 'cod' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Truck className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-text-dark mb-1">Cash on Delivery</h3>
                        <p className="text-sm text-text-gray">Delivery par payment karein</p>
                      </div>
                      {formData.paymentMethod === 'cod' && (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'online' }))}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      formData.paymentMethod === 'online'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        formData.paymentMethod === 'online' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-text-dark mb-1">Online Payment</h3>
                        <p className="text-sm text-text-gray">Bank transfer / JazzCash</p>
                      </div>
                      {formData.paymentMethod === 'online' && (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Delivery Notes */}
              <div className="bg-white rounded-2xl shadow-lg border border-border p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-text-gray" />
                  <h3 className="font-bold text-text-dark">Delivery Notes</h3>
                  <span className="text-xs text-text-gray">(Optional)</span>
                </div>
                <textarea
                  name="deliveryNotes"
                  placeholder="Koi special instructions? (e.g., Call before delivery, Leave at gate, etc.)"
                  rows="3"
                  value={formData.deliveryNotes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-border p-6 sticky top-24">
                <h2 className="text-xl font-bold text-text-dark mb-6">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedWeight}`} className="flex gap-3 pb-4 border-b border-border last:border-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-soft to-gold-light/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">{item.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-text-dark line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-text-gray">{item.selectedWeight} × {item.quantity}</p>
                        <p className="text-sm font-bold text-primary mt-1">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-gray">Subtotal</span>
                    <span className="font-semibold text-text-dark">Rs. {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-gray">Delivery</span>
                    {shipping === 0 ? (
                      <span className="font-bold text-green-600">FREE</span>
                    ) : (
                      <span className="font-semibold text-text-dark">Rs. {shipping}</span>
                    )}
                  </div>
                  {shipping > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                      <Package className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        <span className="font-bold">Rs. {(5000 - totalPrice).toLocaleString()}</span> aur add karein FREE delivery ke liye
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-text-dark text-lg">Total</span>
                  <span className="font-bold text-primary text-2xl">Rs. {grandTotal.toLocaleString()}</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-deep transition-all duration-200 text-lg shadow-lg shadow-primary/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Confirm & Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-text-gray mt-3">
                  Order confirm hone ke baad WhatsApp par details bhej di jayengi
                </p>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <p className="text-xs text-text-gray">Secure & Safe Payment</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <p className="text-xs text-text-gray">Fast Delivery (2-4 days)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-600" />
                    <p className="text-xs text-text-gray">100% Original Products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
