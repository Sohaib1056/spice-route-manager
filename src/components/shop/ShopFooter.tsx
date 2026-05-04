import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export function ShopFooter() {
  const quickLinks = [
    { name: "Home", to: "/" },
    { name: "Products", to: "/products" },
    { name: "About", to: "/about" },
    { name: "Contact", to: "/contact" },
  ];

  const categories = [
    { name: "Almonds", to: "/products?category=Almonds" },
    { name: "Cashews", to: "/products?category=Cashews" },
    { name: "Dates", to: "/products?category=Dates" },
    { name: "Pistachios", to: "/products?category=Pistachios" },
  ];

  return (
    <footer className="bg-[#2d1200] text-[#f5e6d0]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-3 text-[#c8860a] mb-4">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <img 
                src="/chaman_delight_no_bg.png" 
                alt="Chaman Delight Logo" 
                className="h-full w-full object-contain brightness-110 contrast-125"
                onError={(e) => {
                  e.currentTarget.src = "https://i.ibb.co/v4rN8y0/chaman-delight-no-bg.png";
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-black leading-none tracking-tight">Chaman Delight</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8860a]/80 mt-1">Premium Dry Fruit</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-[#f5e6d0]/70 leading-relaxed">
            Premium dry fruits & spices, sourced directly from origin orchards across Pakistan.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg font-semibold text-[#c8860a]">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link to={link.to} className="hover:text-[#c8860a] transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg font-semibold text-[#c8860a]">Categories</h4>
          <ul className="space-y-2 text-sm">
            {categories.map((cat) => (
              <li key={cat.name}>
                <Link to={cat.to} className="hover:text-[#c8860a] transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg font-semibold text-[#c8860a]">Contact</h4>
          <p className="text-sm text-[#f5e6d0]/60">© 2026 Chaman Delight Dry Fruit</p>
          <div className="mt-4 space-y-2 text-sm text-[#f5e6d0]/80">
            <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /> Billa Chowk Satellite Town Gujranwala Pakistan</p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> 
              <a 
                href="https://wa.me/923265153000?text=Salam Chaman Delight! I have an inquiry." 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#c8860a] transition-colors"
              >
                0326 5153000
              </a>
            </p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> chamandelightdryfruit@gmail.com</p>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg font-semibold text-[#c8860a]">Follow Us</h4>
          <div className="flex gap-3">
            {["f", "ig", "x"].map((s) => (
              <a key={s} href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase hover:bg-[#c8860a] hover:text-[#1a0a00]">{s}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-[#f5e6d0]/60">
        © 2026 Chaman Delight Dry Fruit. All rights reserved.
      </div>
    </footer>
  );
}
