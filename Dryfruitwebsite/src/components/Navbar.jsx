import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWebsiteSettings } from '../context/SettingsContext';

export default function Navbar({ onSearch }) {
  const { settings } = useWebsiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle cross-page scrolling
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [location]);

  const navLinks = [
    { name: 'Home', href: 'home', isRoute: false },
    { name: 'Products', href: '/products', isRoute: true },
    { name: 'About', href: 'about', isRoute: false },
    { name: 'Contact', href: 'contact', isRoute: false },
  ];

  const handleNavClick = (e, href, isRoute) => {
    if (isRoute) return;
    
    e.preventDefault();
    setIsMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/' + (href === 'home' ? '' : '#' + href));
      return;
    }

    if (href === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Remove hash if present
      if (window.location.hash) {
        navigate('/', { replace: true });
      }
    } else {
      const element = document.getElementById(href);
      if (element) {
        const offset = 80; // Navbar height offset
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        // Update hash without jump
        navigate('/#' + href, { replace: true });
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
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
                  className="text-text-dark hover:text-primary transition-colors duration-200 font-medium relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full" />
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={`#${link.href}`}
                  onClick={(e) => handleNavClick(e, link.href, link.isRoute)}
                  className="text-text-dark hover:text-primary transition-colors duration-200 font-medium relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full" />
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
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent-gold text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {totalItems}
                </span>
              )}
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
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
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
        {isSearchOpen && (
          <div className="md:hidden pb-4">
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
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border pt-4">
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
                    href={`#${link.href}`}
                    onClick={(e) => handleNavClick(e, link.href, link.isRoute)}
                    className="px-4 py-3 text-text-dark hover:text-primary hover:bg-primary-light rounded-xl transition-all duration-200 font-medium"
                  >
                    {link.name}
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
