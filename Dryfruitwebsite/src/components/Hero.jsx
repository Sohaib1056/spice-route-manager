import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { useReducedMotion } from '../hooks/useReducedMotion';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const features = [
    { icon: Truck, text: 'Free Delivery' },
    { icon: Shield, text: '100% Original' },
    { icon: Star, text: 'Premium Quality' },
  ];

  const heroImages = [
    '/dry fruit.jpg',
    '/dry.jpg',
    '/new.jpg',
  ];

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };

  const pillVariants = {
    hidden: prefersReducedMotion ? {} : { opacity: 0, x: -30 },
    visible: prefersReducedMotion ? {} : { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  const headingVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };

  const wordVariants = {
    hidden: prefersReducedMotion ? {} : { opacity: 0, y: 20 },
    visible: prefersReducedMotion ? {} : { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const subtextVariants = {
    hidden: prefersReducedMotion ? {} : { opacity: 0 },
    visible: prefersReducedMotion ? {} : { 
      opacity: 1,
      transition: { duration: 0.5, delay: 0.6 }
    }
  };

  const buttonVariants = {
    hidden: prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 },
    visible: (custom) => prefersReducedMotion ? {} : ({
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: 0.7 + custom * 0.1
      }
    })
  };

  const badgesVariants = {
    hidden: prefersReducedMotion ? {} : { opacity: 0, y: 20 },
    visible: prefersReducedMotion ? {} : { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: 0.9 }
    }
  };

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
          <motion.div 
            className="text-center md:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={pillVariants}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-light border border-accent-gold/30 rounded-full mb-6"
            >
              <span className="w-2 h-2 bg-accent-gold rounded-full animate-pulse-slow" />
              <span className="text-primary-deep text-sm font-medium">Premium Dry Fruits Store</span>
            </motion.div>
            
            <motion.h1 
              variants={headingVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-dark leading-tight mb-4"
            >
              {['Taza', 'Aur'].map((word, index) => (
                <motion.span key={index} variants={wordVariants} className="inline-block mr-3">
                  {word}
                </motion.span>
              ))}
              <motion.span variants={wordVariants} className="text-primary block">
                Asli Dry Fruits
              </motion.span>
            </motion.h1>
            
            <motion.p 
              variants={subtextVariants}
              className="text-text-gray text-lg md:text-xl mb-8 leading-relaxed"
            >
              Ghar baithe order karein premium quality dry fruits. Free delivery on orders above PKR 5,000.
            </motion.p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-10">
              <motion.div
                variants={buttonVariants}
                custom={0}
              >
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-deep transition-all duration-200 shadow-lg shadow-primary/20 text-lg"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Abhi Order Karein
                </Link>
              </motion.div>
              <motion.div
                variants={buttonVariants}
                custom={1}
              >
                <a
                  href="https://wa.me/923265153000?text=Assalam%20o%20Alaikum!%20Mujhe%20dry%20fruits%20order%20karne%20hain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-whatsapp text-white font-bold rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg shadow-whatsapp/20 text-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp pe Order
                </a>
              </motion.div>
            </div>

            {/* Trust Features */}
            <motion.div 
              variants={badgesVariants}
              className="flex flex-wrap justify-center md:justify-start gap-6"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-text-dark font-medium">{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Image Slider */}
          <div className="flex justify-center md:justify-end">
            <div className="relative group">
              <div className="w-full max-w-[380px] h-[480px] md:max-w-[450px] md:h-[550px] bg-gradient-to-br from-primary-light to-gold-light rounded-3xl overflow-hidden shadow-2xl relative">
                <Swiper
                  modules={[Autoplay, EffectFade, Pagination]}
                  effect="fade"
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    clickable: true,
                    bulletActiveClass: 'swiper-pagination-bullet-active-custom',
                  }}
                  loop={true}
                  className="w-full h-full hero-swiper"
                  style={{ willChange: 'transform' }}
                >
                  {heroImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="w-full h-full relative overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Premium Dry Fruits ${index + 1}`}
                          className="w-full h-full object-cover ken-burns-effect"
                          loading={index === 0 ? 'eager' : 'lazy'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              
              {/* Floating Badge with animation */}
              <motion.div 
                animate={prefersReducedMotion ? {} : {
                  y: [0, -8, 0],
                }}
                transition={prefersReducedMotion ? {} : {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-border/50 backdrop-blur-sm z-10"
                style={{ willChange: 'transform' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gold-light rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-accent-gold fill-accent-gold" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-dark">4.9</p>
                    <p className="text-sm text-text-gray">500+ Reviews</p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-gold/10 rounded-full blur-2xl -z-10 animate-pulse" />
              <div className="absolute top-1/2 -right-8 w-16 h-16 bg-primary/10 rounded-full blur-xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
