import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SHOP_PRODUCTS, CATEGORIES } from "@/data/storefront";
import { ProductCard } from "@/components/shop/ProductCard";
import { formatPKR } from "@/lib/format";

const STOCK = ["In Stock", "Low Stock", "Out of Stock"] as const;

export default function ShopProducts() {
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("category") ?? "all";
  const [category, setCategory] = useState(initialCat);
  const [maxPrice, setMaxPrice] = useState(7000);
  const [stockFilter, setStockFilter] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return SHOP_PRODUCTS.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (p.price > maxPrice) return false;
      if (stockFilter.length && !stockFilter.includes(p.stock)) return false;
      return true;
    });
  }, [category, maxPrice, stockFilter]);

  const setCat = (id: string) => {
    setCategory(id);
    if (id === "all") params.delete("category");
    else params.set("category", id);
    setParams(params, { replace: true });
  };

  const toggleStock = (s: string) =>
    setStockFilter((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#f5e6d0] md:text-4xl">All Products</h1>
        <p className="mt-2 text-[#f5e6d0]/70">{filtered.length} items available</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className="h-fit rounded-2xl bg-[#fff8f0] p-5 text-[#3b1a00]">
          <div>
            <h3 className="mb-3 font-display text-lg font-semibold">Category</h3>
            <ul className="space-y-1">
              {[{ id: "all", name: "All" }, ...CATEGORIES].map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setCat(c.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                      category === c.id
                        ? "bg-[#c8860a] font-semibold text-[#1a0a00]"
                        : "hover:bg-[#3b1a00]/5"
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 font-display text-lg font-semibold">Price Range</h3>
            <input
              type="range"
              min={500}
              max={7000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#c8860a]"
            />
            <p className="mt-2 text-xs text-[#3b1a00]/70">Up to {formatPKR(maxPrice)}</p>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 font-display text-lg font-semibold">Stock Status</h3>
            <ul className="space-y-2">
              {STOCK.map((s) => (
                <li key={s}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={stockFilter.includes(s)}
                      onChange={() => toggleStock(s)}
                      className="h-4 w-4 accent-[#c8860a]"
                    />
                    {s}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Grid */}
        <section>
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-[#fff8f0] p-12 text-center text-[#3b1a00]">
              <p className="text-lg font-semibold">No products match your filters</p>
              <p className="mt-2 text-sm text-[#3b1a00]/60">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
