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
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = products.find(p => p.id === parseInt(id));
  const [selectedWeight, setSelectedWeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (product && product.weightOptions.length > 0) {
      setSelectedWeight(product.weightOptions[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brown-900 mb-4">Product nahi mila</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-brown-600 hover:text-brown-800 underline"
          >
            Products page par wapas jayen
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = product.pricePerWeight[selectedWeight];
  const originalPrice = product.originalPrice[selectedWeight];
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedWeight,
      price: currentPrice,
      quantity
    });
    toast.success(`${product.name} cart mein add ho gaya!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brown-600 hover:text-brown-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Wapas jayen</span>
        </button>

        {/* Product Details */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image Section */}
            <div className="flex items-center justify-center bg-gradient-to-br from-brown-50 to-cream rounded-xl p-12">
              <div className="text-center">
                <div className="text-9xl mb-4">{product.emoji}</div>
                {product.badge && (
                  <span className="inline-block px-4 py-2 bg-brown-600 text-white text-sm font-semibold rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col">
              <div className="mb-4">
                <span className="text-sm text-brown-600 font-medium">{product.category}</span>
                <h1 className="text-3xl font-bold text-brown-900 mt-2 mb-1">
                  {product.name}
                </h1>
                <p className="text-xl text-brown-700 font-urdu">{product.nameUrdu}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-brown-700 font-medium">{product.rating}</span>
                <span className="text-brown-500">({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-brown-900">
                    Rs. {currentPrice}
                  </span>
                  <span className="text-2xl text-gray-400 line-through">
                    Rs. {originalPrice}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                    {discount}% OFF
                  </span>
                </div>
                <p className="text-sm text-brown-600">Inclusive of all taxes</p>
              </div>

              {/* Weight Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-brown-900 mb-3">
                  Weight Select Karein:
                </label>
                <div className="flex gap-3">
                  {product.weightOptions.map((weight) => (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        selectedWeight === weight
                          ? 'bg-brown-600 text-white shadow-md'
                          : 'bg-brown-50 text-brown-700 hover:bg-brown-100'
                      }`}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-brown-900 mb-3">
                  Quantity:
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-brown-200 rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      className="p-3 hover:bg-brown-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-5 h-5 text-brown-700" />
                    </button>
                    <span className="px-6 py-2 font-semibold text-brown-900">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="p-3 hover:bg-brown-50 transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-5 h-5 text-brown-700" />
                    </button>
                  </div>
                  <span className="text-sm text-brown-600">
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-brown-600 text-white py-4 rounded-lg font-semibold hover:bg-brown-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    isFavorite
                      ? 'border-red-500 bg-red-50'
                      : 'border-brown-200 hover:border-red-500'
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isFavorite ? 'fill-red-500 text-red-500' : 'text-brown-600'
                    }`}
                  />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brown-100">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-brown-600 mx-auto mb-2" />
                  <p className="text-xs text-brown-600">Free Delivery</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-brown-600 mx-auto mb-2" />
                  <p className="text-xs text-brown-600">Quality Assured</p>
                </div>
                <div className="text-center">
                  <Package className="w-6 h-6 text-brown-600 mx-auto mb-2" />
                  <p className="text-xs text-brown-600">Secure Packaging</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Description */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-brown-900 mb-4">Product Description</h2>
            <p className="text-brown-700 leading-relaxed mb-6">{product.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brown-600 mt-1" />
                <div>
                  <p className="font-semibold text-brown-900">Origin</p>
                  <p className="text-brown-600">{product.origin}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brown-600 mt-1" />
                <div>
                  <p className="font-semibold text-brown-900">Shelf Life</p>
                  <p className="text-brown-600">{product.shelfLife}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-brown-600 mt-1" />
                <div>
                  <p className="font-semibold text-brown-900">Storage</p>
                  <p className="text-brown-600">{product.storageInfo}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-brown-600 mt-1" />
                <div>
                  <p className="font-semibold text-brown-900">Stock Status</p>
                  <p className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-brown-900 mb-4">Delivery Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-brown-600 mt-1" />
                <div>
                  <p className="font-semibold text-brown-900">Free Delivery</p>
                  <p className="text-sm text-brown-600">Orders above Rs. 2000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brown-600 mt-1" />
                <div>
                  <p className="font-semibold text-brown-900">Delivery Time</p>
                  <p className="text-sm text-brown-600">2-4 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brown-600 mt-1" />
                <div>
                  <p className="font-semibold text-brown-900">Quality Guarantee</p>
                  <p className="text-sm text-brown-600">100% authentic products</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-brown-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="bg-gradient-to-br from-brown-50 to-cream rounded-lg p-6 mb-3 group-hover:shadow-lg transition-shadow">
                    <div className="text-6xl text-center">{relatedProduct.emoji}</div>
                  </div>
                  <h3 className="font-semibold text-brown-900 mb-1 group-hover:text-brown-600">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-brown-600 text-sm mb-2">{relatedProduct.nameUrdu}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brown-900">
                      Rs. {relatedProduct.pricePerWeight[relatedProduct.weightOptions[0]]}
                    </span>
                    <span className="text-xs text-gray-500">
                      /{relatedProduct.weightOptions[0]}
                    </span>
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
