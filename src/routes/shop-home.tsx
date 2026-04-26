import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Leaf } from "lucide-react";
import { CATEGORIES, SHOP_PRODUCTS } from "@/data/storefront";
import { ProductCard } from "@/components/shop/ProductCard";

export default function ShopHome() {
  const featured = SHOP_PRODUCTS.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1a0a00] py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #c8860a 0%, transparent 40%), radial-gradient(circle at 80% 70%, #5a8a3c 0%, transparent 35%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center md:px-8">
          <span className="inline-block rounded-full border border-[#c8860a]/40 bg-[#c8860a]/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#c8860a]">
            🌿 Premium Quality
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-[#f5e6d0] md:text-6xl">
            Premium Dry Fruits & Spices —{" "}
            <span className="text-[#c8860a]">Straight from the Source</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-[#f5e6d0]/80 md:text-lg">
            Hand-picked almonds, cashews, dates and rare spices from Pakistan, Iran and Kashmir — delivered fresh to your door.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-[#c8860a] px-6 py-3 font-semibold text-[#1a0a00] transition hover:brightness-110"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#categories"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-[#c8860a] px-6 py-3 font-semibold text-[#c8860a] transition hover:bg-[#c8860a] hover:text-[#1a0a00]"
            >
              View Categories
            </a>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-[#2d1200] py-8">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 text-[#f5e6d0] sm:grid-cols-3 md:px-8">
          {[
            { icon: <Truck className="h-5 w-5" />, t: "Free Delivery", s: "Over PKR 5,000" },
            { icon: <ShieldCheck className="h-5 w-5" />, t: "100% Pure", s: "No additives" },
            { icon: <Leaf className="h-5 w-5" />, t: "Farm Fresh", s: "Source verified" },
          ].map((b) => (
            <div key={b.t} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c8860a]/20 text-[#c8860a]">
                {b.icon}
              </span>
              <div>
                <p className="text-sm font-semibold">{b.t}</p>
                <p className="text-xs text-[#f5e6d0]/60">{b.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="bg-[#1a0a00] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-[#f5e6d0] md:text-4xl">Shop by Category</h2>
            <p className="mt-3 text-[#f5e6d0]/70">Explore our curated collections</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.id}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-[#fff8f0] p-6 text-center text-[#3b1a00] transition hover:-translate-y-1 hover:border-[#c8860a] hover:shadow-xl"
              >
                <span className="text-5xl transition group-hover:scale-110">{c.icon}</span>
                <p className="font-display text-lg font-semibold">{c.name}</p>
                <p className="text-xs text-[#3b1a00]/60">{c.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-[#2d1200] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold text-[#f5e6d0] md:text-4xl">Featured Products</h2>
              <p className="mt-2 text-[#f5e6d0]/70">Bestsellers loved by our customers</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-[#c8860a] hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
