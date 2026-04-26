import { Link } from "react-router-dom";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPKR } from "@/lib/format";

export default function ShopCart() {
  const { items, setQty, remove, subtotal, clear } = useCart();
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 250;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="mb-8 font-display text-3xl font-bold text-[#f5e6d0] md:text-4xl">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-[#fff8f0] p-12 text-center text-[#3b1a00]">
          <p className="text-5xl">🛒</p>
          <p className="mt-4 text-lg font-semibold">Your cart is empty</p>
          <Link to="/products" className="mt-6 inline-block rounded-lg bg-[#c8860a] px-6 py-3 font-semibold text-[#1a0a00]">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.weight ?? ""}`}
                className="flex gap-4 rounded-2xl bg-[#fff8f0] p-4 text-[#3b1a00]"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-[#fff8f0] to-[#f5e6d0] text-5xl">
                  {item.image ?? "🥜"}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-base font-semibold">{item.name}</p>
                      {item.weight && <p className="text-xs text-[#3b1a00]/60">{item.weight}</p>}
                    </div>
                    <button onClick={() => remove(item.id, item.weight)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQty(item.id, item.qty - 1, item.weight)} className="rounded-md border border-[#3b1a00]/20 p-1 hover:bg-[#3b1a00]/5">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                      <button onClick={() => setQty(item.id, item.qty + 1, item.weight)} className="rounded-md border border-[#3b1a00]/20 p-1 hover:bg-[#3b1a00]/5">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-display text-lg font-bold text-[#c8860a]">{formatPKR(item.price * item.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={clear} className="text-sm text-[#f5e6d0]/60 hover:text-[#c8860a]">
              Clear cart
            </button>
          </div>

          <aside className="h-fit rounded-2xl bg-[#fff8f0] p-6 text-[#3b1a00]">
            <h3 className="mb-4 font-display text-xl font-semibold">Order Summary</h3>
            <div className="space-y-3 border-b border-[#3b1a00]/10 pb-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPKR(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPKR(shipping)}</span></div>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="font-display text-lg font-semibold">Total</span>
              <span className="font-display text-2xl font-bold text-[#c8860a]">{formatPKR(total)}</span>
            </div>
            <button className="w-full rounded-lg bg-[#c8860a] py-3 font-bold text-[#1a0a00] hover:brightness-110">
              Proceed to Checkout
            </button>
            <Link to="/products" className="mt-3 block text-center text-sm text-[#3b1a00]/70 hover:text-[#c8860a]">
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
