import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Star, ChevronLeft } from "lucide-react";
import { findProduct, SHOP_PRODUCTS } from "@/data/storefront";
import { useCart } from "@/context/CartContext";
import { formatPKR } from "@/lib/format";
import { ProductCard } from "@/components/shop/ProductCard";
import toast from "react-hot-toast";

export default function ShopProductDetail() {
  const { id = "" } = useParams();
  const product = findProduct(id);
  const { add, open } = useCart();
  const [weightIdx, setWeightIdx] = useState(1);
  const [qty, setQty] = useState(1);

  if (!product) return <Navigate to="/products" replace />;

  const weight = product.weights[weightIdx];
  const price = Math.round(product.price * weight.multiplier);
  const disabled = product.stock === "Out of Stock";

  const handleAdd = () => {
    add({
      id: product.id,
      name: product.name,
      price,
      qty,
      weight: weight.label,
      image: product.image,
    });
    setQty(1); // Reset quantity after adding to cart
    toast.success(`${product.name} added to cart`);
    open();
  };

  const related = SHOP_PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Link to="/products" className="mb-6 inline-flex items-center gap-1 text-sm text-[#c8860a] hover:underline">
        <ChevronLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff8f0] to-[#f5e6d0] text-[12rem]">
          {product.image}
        </div>

        <div className="flex flex-col text-[#f5e6d0]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#c8860a]">{product.category}</p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="flex text-[#c8860a]">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-current" />)}
            </div>
            <span className="text-[#f5e6d0]/60">(124 reviews)</span>
          </div>

          <p className="mt-5 font-display text-4xl font-bold text-[#c8860a]">{formatPKR(price)}</p>
          <p className="mt-4 text-[#f5e6d0]/80">{product.description}</p>

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold">Select Weight</p>
            <div className="flex flex-wrap gap-2">
              {product.weights.map((w, i) => (
                <button
                  key={w.label}
                  onClick={() => setWeightIdx(i)}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition ${
                    i === weightIdx
                      ? "border-[#c8860a] bg-[#c8860a] text-[#1a0a00]"
                      : "border-[#f5e6d0]/20 text-[#f5e6d0] hover:border-[#c8860a]"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-lg border border-[#f5e6d0]/20">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-white/10">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-white/10">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={disabled}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#c8860a] px-6 py-3 font-bold text-[#1a0a00] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
          </div>

          <p className={`mt-4 text-sm font-semibold ${product.stock === "In Stock" ? "text-green-400" : product.stock === "Low Stock" ? "text-amber-400" : "text-red-400"}`}>
            {product.stock}
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-2xl font-bold text-[#f5e6d0] md:text-3xl">Related Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
