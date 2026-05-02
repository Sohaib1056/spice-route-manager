import { Link } from 'react-router-dom';
import { Truck, Shield, Award, Clock } from 'lucide-react';

export default function AboutSection() {
  const features = [
    { 
      icon: Shield, 
      number: '100%', 
      label: 'Original Products',
      description: 'Guaranteed authenticity'
    },
    { 
      icon: Truck, 
      number: 'FREE', 
      label: 'Delivery',
      description: 'On orders above Rs. 5,000'
    },
    { 
      icon: Award, 
      number: '500+', 
      label: 'Happy Customers',
      description: 'Trust karte hain hum pe'
    },
    { 
      icon: Clock, 
      number: '2-4', 
      label: 'Business Days Delivery',
      description: 'Fast & reliable'
    },
  ];

  return (
    <section id="about" className="bg-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-primary-soft border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                {feature.number}
              </div>
              <div className="font-semibold text-text-dark mb-1">{feature.label}</div>
              <div className="text-sm text-text-gray">{feature.description}</div>
            </div>
          ))}
        </div>

        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-light rounded-full mb-6">
              <span className="text-accent-gold font-semibold text-sm">Hamari Kahani</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6">
              DryFruit Pro
              <span className="text-primary block">Quality Ka Bharosa</span>
            </h2>

            <div className="space-y-4 text-text-gray leading-relaxed text-lg">
              <p>
                DryFruit Pro mein hum aapko best quality dry fruits provide karte hain jo seedha premium farms se import kiye jate hain - California ke badaam ho ya Afghanistan ke mamra, Iran ke pistachios ho ya Madina ke Ajwa dates.
              </p>
              <p>
                Humare har product ki quality check hoti hai aur fresh packing ke saath aap tak deliver kiya jata hai. Cash on Delivery available hai aur Rs. 5,000 se upar FREE delivery!
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-deep transition-colors duration-200"
              >
                Products Dekhein
              </Link>
              <a
                href="https://wa.me/923211234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-whatsapp text-white font-bold rounded-xl hover:bg-green-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Karein
              </a>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-full max-w-[400px] h-[450px] md:h-[500px] bg-gradient-to-br from-primary-light to-gold-light rounded-3xl overflow-hidden shadow-2xl relative">
                <img 
                  src="/dry.jpg" 
                  alt="Quality Dry Fruits" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
              </div>
              
              {/* Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-2xl border border-border/50 backdrop-blur-sm z-10 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">Verified</p>
                    <p className="text-sm text-text-gray font-medium">Quality Products</p>
                  </div>
                </div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl -z-10 animate-pulse-slow" />
              <div className="absolute bottom-1/2 -left-8 w-14 h-14 bg-accent-gold/10 rounded-full blur-xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
