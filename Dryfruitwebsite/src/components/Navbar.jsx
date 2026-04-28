import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar({ onSearch }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', href: '/', isRoute: true },
    { name: 'Products', href: '/products', isRoute: true },
    { name: 'About', href: '#about', isRoute: false },
    { name: 'Contact', href: '#contact', isRoute: false },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-gold rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🥜</span>
            </div>
            <div>
              <span className="text-xl font-bold text-primary block leading-tight">DryFruit Pro</span>
              <span className="text-[10px] text-text-gray hidden sm:block">Premium Quality</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
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
                  href={link.href}
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

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
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
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
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
