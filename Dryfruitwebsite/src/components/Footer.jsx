import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, MapPin, Mail } from 'lucide-react';
import { useWebsiteSettings } from '../context/SettingsContext';

export default function Footer() {
  const { settings } = useWebsiteSettings();
  const quickLinks = [
    { name: 'Home', href: 'home' },
    { name: 'Products', href: '/products', isRoute: true },
    { name: 'About', href: 'about' },
    { name: 'Contact', href: 'contact' },
  ];

  const categories = [
    { name: 'Almonds', href: '/products?category=Almonds' },
    { name: 'Cashews', href: '/products?category=Cashews' },
    { name: 'Dates', href: '/products?category=Dates' },
    { name: 'Pistachios', href: '/products?category=Pistachios' },
  ];

  const handleLinkClick = (e, href, isRoute) => {
    if (isRoute) return;
    e.preventDefault();
    const target = href === 'home' ? 0 : document.getElementById(href)?.offsetTop - 80;
    window.scrollTo({ top: target || 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-footer-bg text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1 - Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <img 
                  src="/chaman_delight_no_bg.png" 
                  alt="Chaman Delight Logo" 
                  className="w-full h-full object-contain brightness-110 contrast-110 drop-shadow-md" 
                  onError={(e) => {
                    e.currentTarget.src = "https://i.ibb.co/v4rN8y0/chaman-delight-no-bg.png";
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black bg-gradient-to-r from-primary to-accent-gold bg-clip-text text-transparent leading-none tracking-tight">
                  {settings.companyName}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-footer-link mt-1">Premium Dry Fruit</span>
              </div>
            </Link>
            <p className="text-footer-link mb-6 leading-relaxed">
              Premium quality dry fruits aur spices. {settings.address}. Free delivery on orders above Rs. 5,000.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-footer-border flex items-center justify-center text-footer-link hover:text-white hover:bg-primary transition-all duration-200"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      className="text-footer-link hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={`#${link.href}`}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-footer-link hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Categories */}
          <div>
            <h4 className="font-bold text-lg mb-4">Categories</h4>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    to={cat.href}
                    className="text-footer-link hover:text-white transition-colors duration-200"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" />
                <div>
                  <a 
                    href={`https://wa.me/923265153000?text=Salam Chaman Delight! I have an inquiry.`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white font-semibold hover:text-accent-gold transition-colors"
                  >
                    0326 5153000
                  </a>
                  <p className="text-footer-link text-sm">WhatsApp available</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" />
                <span className="text-footer-link">
                  {settings.address}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" />
                <a href={`mailto:${settings.email}`} className="text-footer-link hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-footer-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-footer-link text-sm text-center md:text-left">
              {new Date().getFullYear()} {settings.companyName}. All rights reserved.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-footer-link">
              <span>Cash on Delivery</span>
              <span className="text-footer-border">|</span>
              <span>Free Delivery Rs. 5000+</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
