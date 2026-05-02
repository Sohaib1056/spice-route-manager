import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Search, ShoppingCart, Menu, X, User, Nut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function ShopNavbar() {
  const { count, open } = useCart();
  const { pathname } = useLocation();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#2d1200] text-[#f5e6d0] shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-[#c8860a]" onClick={() => setMobile(false)}>
          <Nut className="h-6 w-6 text-amber-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-amber-700 to-walnut bg-clip-text text-transparent">
            Chaman Delight
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[#c8860a]",
                  active && "text-[#c8860a]"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="hidden sm:inline-flex rounded-full p-2 hover:bg-white/10" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={open}
            className="relative rounded-full p-2 hover:bg-white/10"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c8860a] px-1 text-[10px] font-bold text-[#1a0a00]">
                {count}
              </span>
            )}
          </button>
          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#c8860a] px-4 py-2 text-sm font-semibold text-[#1a0a00] transition hover:brightness-110"
          >
            <User className="h-4 w-4" /> Login
          </Link>
          <button
            className="md:hidden rounded-md p-2 hover:bg-white/10"
            onClick={() => setMobile((m) => !m)}
            aria-label="Menu"
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="md:hidden border-t border-white/10 bg-[#2d1200] px-4 py-3">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobile(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10",
                  pathname === l.to && "bg-white/10 text-[#c8860a]"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setMobile(false)}
              className="mt-2 rounded-lg bg-[#c8860a] px-3 py-2 text-center text-sm font-semibold text-[#1a0a00]"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
