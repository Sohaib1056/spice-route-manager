import { ShoppingBag, Truck, Shield, Star } from 'lucide-react';

export default function Hero() {
  const features = [
    { icon: Truck, text: 'Free Delivery' },
    { icon: Shield, text: '100% Original' },
    { icon: Star, text: 'Premium Quality' },
  ];

  return (
    <section id="home" className="bg-primary-soft relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-accent-gold" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-primary" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-light border border-accent-gold/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-accent-gold rounded-full animate-pulse-slow" />
              <span className="text-primary-deep text-sm font-medium">Premium Dry Fruits Store</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-dark leading-tight mb-4">
              Taza Aur
              <span className="text-primary block">Asli Dry Fruits</span>
            </h1>
            
            <p className="text-text-gray text-lg md:text-xl mb-8 leading-relaxed">
              Ghar baithe order karein premium quality dry fruits. Free delivery on orders above PKR 5,000.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-10">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-deep transition-all duration-200 shadow-lg shadow-primary/20 text-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Abhi Order Karein
              </a>
              <a
                href="https://wa.me/923211234567?text=Assalam%20o%20Alaikum!%20Mujhe%20dry%20fruits%20order%20karne%20hain"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-whatsapp text-white font-bold rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg shadow-whatsapp/20 text-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp pe Order
              </a>
            </div>

            {/* Trust Features */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-text-dark font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image/Visual */}
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              <div className="w-full max-w-[420px] h-[320px] md:h-[420px] bg-gradient-to-br from-primary-light to-gold-light rounded-3xl flex items-center justify-center overflow-hidden shadow-xl">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">
                    <span role="img" aria-label="almonds">🥜</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">Premium</p>
                  <p className="text-lg text-text-gray">Dry Fruits</p>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gold-light rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-accent-gold fill-accent-gold" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-dark">4.9</p>
                    <p className="text-sm text-text-gray">500+ Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
