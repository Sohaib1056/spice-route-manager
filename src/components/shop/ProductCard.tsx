import { Link } from "react-router-dom";
import { Eye, ShoppingCart } from "lucide-react";
import type { ShopProduct } from "@/data/storefront";
import { useCart } from "@/context/CartContext";
import { formatPKR } from "@/lib/format";
import toast from "react-hot-toast";

const stockClass = {
  "In Stock": "bg-green-100 text-green-700 border-green-200",
  "Low Stock": "bg-amber-100 text-amber-700 border-amber-200",
  "Out of Stock": "bg-red-100 text-red-700 border-red-200",
} as const;

export function ProductCard({ product }: { product: ShopProduct }) {
  const { add, open } = useCart();
  const disabled = product.stock === "Out of Stock";

  const handleAdd = () => {
    add({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      weight: "500g",
      image: product.image,
    });
    toast.success(`${product.name} added to cart`);
    open();
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#3b1a00]/10 bg-[#fff8f0] text-[#3b1a00] shadow-sm transition hover:-translate-y-1 hover:border-[#c8860a] hover:shadow-xl">
      <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-[#fff8f0] to-[#f5e6d0] text-7xl">
        {product.image}
        <span
          className={`absolute top-3 left-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${stockClass[product.stock]}`}
        >
          {product.stock}
        </span>
        <Link
          to={`/products/${product.id}`}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#3b1a00] opacity-0 shadow transition group-hover:opacity-100 hover:bg-[#c8860a] hover:text-[#1a0a00]"
          aria-label="Quick view"
        >
          <Eye className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to={`/products/${product.id}`} className="hover:text-[#c8860a]">
          <h3 className="line-clamp-2 font-display text-base font-semibold">{product.name}</h3>
        </Link>
        <p className="text-xs text-[#3b1a00]/60 capitalize">{product.category}</p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold text-[#c8860a]">{formatPKR(product.price)}</span>
          <button
            onClick={handleAdd}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#c8860a] px-3 py-2 text-xs font-bold text-[#1a0a00] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
