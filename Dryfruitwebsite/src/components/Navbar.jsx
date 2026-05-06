import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWebsiteSettings } from '../context/SettingsContext';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function Navbar({ onSearch }) {
  const { settings } = useWebsiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { totalItems } = useCart();
  const [prevTotalItems, setPrevTotalItems] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart item count pulse animation
  useEffect(() => {
    if (totalItems > prevTotalItems) {
      // Trigger pulse animation
      setPrevTotalItems(totalItems);
    }
  }, [totalItems, prevTotalItems]);

  // Handle cross-page scrolling
  useEffect(() => {
    const scrollToSection = () => {
      if (location.pathname === '/') {
        const hash = location.hash || window.location.hash;
        if (hash) {
          const id = hash.replace('#', '');
          const element = document.getElementById(id);
          if (element) {
            const offset = 100; // Increased offset for better visibility
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            // Use a small timeout to ensure layout is stable
            setTimeout(() => {
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }, 0);
          }
        }
      }
    };

    // Run when pathname or hash changes
    scrollToSection();
    
    // Also run after a small delay to ensure content is rendered
    const timer = setTimeout(scrollToSection, 300);
    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  const navLinks = [
    { name: 'Home', href: '/', isRoute: false },
    { name: 'Products', href: '/products', isRoute: true },
    { name: 'About', href: '/#about', isRoute: false },
    { name: 'Contact', href: '/#contact', isRoute: false },
  ];

  const handleNavClick = (e, href, isRoute) => {
    if (isRoute) return;
    
    e.preventDefault();
    setIsMenuOpen(false);

    // Extract the section ID from href (e.g., '/#about' -> 'about')
    const sectionId = href.includes('#') ? href.split('#')[1] : href;

    if (sectionId === 'home' || href === '/' || sectionId === '') {
      if (location.pathname !== '/') {
        window.location.href = '/';
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash) {
        navigate('/', { replace: true });
      }
      return;
    }

    if (location.pathname !== '/') {
      // Force immediate navigation with hash to ensure useEffect in Navbar catches it
      window.location.href = (href.startsWith('/') ? '' : '/') + href;
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      navigate('/#' + sectionId, { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <motion.nav 
      initial={{ y: 0 }}
      animate={{ 
        boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
      }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-border ${
        scrolled ? 'backdrop-blur-lg' : ''
      }`}
      style={{ willChange: 'transform' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-16 h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <img 
                src="/chaman_delight_no_bg.png" 
                alt="Chaman Delight Logo" 
                className="w-full h-full object-contain brightness-105 contrast-110 drop-shadow-md" 
                onError={(e) => {
                  e.currentTarget.src = "https://i.ibb.co/v4rN8y0/chaman-delight-no-bg.png";
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black bg-gradient-to-r from-primary to-accent-gold bg-clip-text text-transparent leading-none tracking-tight">
                {settings.companyName}
              </span>
              <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-text-gray mt-1">Premium Dry Fruit</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-text-dark hover:text-primary transition-colors duration-200 font-medium relative group nav-link"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href.startsWith('/') ? link.href : `#${link.href}`}
                  onClick={(e) => handleNavClick(e, link.href, link.isRoute)}
                  className="text-text-dark hover:text-primary transition-colors duration-200 font-medium relative group nav-link"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
                </a>
              )
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-gray" />
              <input
                type="text"
                placeholder="Search dry fruits..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="w-[200px] lg:w-[260px] pl-10 pr-4 py-2.5 bg-primary-soft border border-transparent rounded-xl text-text-dark placeholder:text-text-gray focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </form>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-deep transition-colors duration-200 font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden lg:inline">Cart</span>
              <AnimatePresence mode="wait">
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={prefersReducedMotion ? {} : { scale: 0 }}
                    animate={prefersReducedMotion ? {} : { scale: 1 }}
                    exit={prefersReducedMotion ? {} : { scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-accent-gold text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <div className="h-12 w-12 flex items-center justify-center mr-1">
              <img 
                src="/chaman_delight_no_bg.png" 
                alt="Logo" 
                className="h-full w-full object-contain brightness-110" 
                onError={(e) => {
                  e.currentTarget.src = "https://i.ibb.co/v4rN8y0/chaman-delight-no-bg.png";
                }}
              />
            </div>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 rounded-xl hover:bg-primary-light transition-colors duration-200"
            >
              <Search className="w-5 h-5 text-primary" />
            </button>

            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-primary text-white"
            >
              <ShoppingCart className="w-5 h-5" />
              <AnimatePresence mode="wait">
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={prefersReducedMotion ? {} : { scale: 0 }}
                    animate={prefersReducedMotion ? {} : { scale: 1 }}
                    exit={prefersReducedMotion ? {} : { scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-accent-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-xl hover:bg-primary-light transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { height: 'auto', opacity: 1 }}
              exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden pb-4 overflow-hidden"
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-gray" />
                <input
                  type="text"
                  placeholder="Dry fruits search karein..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (onSearch) onSearch(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-primary-soft border border-transparent rounded-xl text-text-dark placeholder:text-text-gray focus:border-primary focus:bg-white transition-all duration-200"
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { height: 'auto', opacity: 1 }}
              exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden pb-4 border-t border-border pt-4 overflow-hidden"
            >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 text-text-dark hover:text-primary hover:bg-primary-light rounded-xl transition-all duration-200 font-medium"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href.startsWith('/') ? link.href : `#${link.href}`}
                    onClick={(e) => handleNavClick(e, link.href, link.isRoute)}
                    className="px-4 py-3 text-text-dark hover:text-primary hover:bg-primary-light rounded-xl transition-all duration-200 font-medium"
                  >
                    {link.name}
                  </a>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.nav>
  );
}
