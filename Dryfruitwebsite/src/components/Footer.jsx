import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Products', href: '#products' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const categories = [
    { name: 'Almonds', href: '#products' },
    { name: 'Cashews', href: '#products' },
    { name: 'Dates', href: '#products' },
    { name: 'Pistachios', href: '#products' },
  ];

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
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-gold rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🥜</span>
              </div>
              <span className="text-xl font-bold">DryFruit Pro</span>
            </Link>
            <p className="text-footer-link mb-6 leading-relaxed">
              Premium quality dry fruits aur spices. Direct import, best prices, free delivery on orders above Rs. 5,000.
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
                  <a
                    href={link.href}
                    className="text-footer-link hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
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
                  <a
                    href={cat.href}
                    className="text-footer-link hover:text-white transition-colors duration-200"
                  >
                    {cat.name}
                  </a>
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
                  <a href="tel:+923211234567" className="text-white font-semibold hover:text-accent-gold transition-colors">
                    0321-1234567
                  </a>
                  <p className="text-footer-link text-sm">WhatsApp available</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" />
                <span className="text-footer-link">
                  Shop 42, Johar Town Market, Lahore
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" />
                <a href="mailto:info@dryfruitpro.com" className="text-footer-link hover:text-white transition-colors">
                  info@dryfruitpro.com
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
              2026 DryFruit Pro. All rights reserved.
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
