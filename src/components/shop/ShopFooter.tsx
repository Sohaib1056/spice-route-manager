import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function ShopFooter() {
  return (
    <footer className="bg-[#2d1200] text-[#f5e6d0]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2 text-[#c8860a]">
            <span className="text-2xl">🌿</span>
            <span className="font-display text-xl font-bold">DryFruit Pro</span>
          </div>
          <p className="mt-3 text-sm text-[#f5e6d0]/70">
            Premium dry fruits & spices, sourced directly from origin orchards across Pakistan, Iran, and Kashmir.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg font-semibold text-[#c8860a]">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-[#c8860a]">Home</Link></li>
            <li><Link to="/products" className="hover:text-[#c8860a]">Products</Link></li>
            <li><Link to="/about" className="hover:text-[#c8860a]">About</Link></li>
            <li><Link to="/contact" className="hover:text-[#c8860a]">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg font-semibold text-[#c8860a]">Contact</h4>
          <ul className="space-y-3 text-sm text-[#f5e6d0]/80">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +92 300 1234567</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@dryfruitpro.pk</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Lahore, Pakistan</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg font-semibold text-[#c8860a]">Follow Us</h4>
          <div className="flex gap-3">
            <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-[#c8860a] hover:text-[#1a0a00]"><Facebook className="h-4 w-4" /></a>
            <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-[#c8860a] hover:text-[#1a0a00]"><Instagram className="h-4 w-4" /></a>
            <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-[#c8860a] hover:text-[#1a0a00]"><Twitter className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-[#f5e6d0]/60">
        © 2026 DryFruit Pro. All rights reserved.
      </div>
    </footer>
  );
}
