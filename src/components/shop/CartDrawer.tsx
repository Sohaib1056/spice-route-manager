import { Link } from "react-router-dom";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPKR } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, subtotal } = useCart();

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-50 bg-black/50" onClick={close} />}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#fff8f0] text-[#3b1a00] shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-[#3b1a00]/10 bg-[#2d1200] px-5 py-4 text-[#f5e6d0]">
          <h3 className="font-display text-lg font-semibold">Your Cart ({items.length})</h3>
          <button onClick={close} className="rounded-full p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="text-5xl">🛒</span>
              <p className="mt-4 text-sm text-[#3b1a00]/60">Your cart is empty</p>
              <Link
                to="/products"
                onClick={close}
                className="mt-4 rounded-lg bg-[#c8860a] px-5 py-2 text-sm font-semibold text-[#1a0a00]"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={`${item.id}-${item.weight ?? ""}`}
                  className="flex gap-3 rounded-xl border border-[#3b1a00]/10 bg-white p-3"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#fff8f0] text-3xl">
                    {item.image ?? "🥜"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    {item.weight && <p className="text-xs text-[#3b1a00]/60">{item.weight}</p>}
                    <p className="mt-1 text-sm font-bold text-[#c8860a]">{formatPKR(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => setQty(item.id, item.qty - 1, item.weight)}
                        className="rounded-md border border-[#3b1a00]/20 p-1 hover:bg-[#fff8f0]"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                      <button
                        onClick={() => setQty(item.id, item.qty + 1, item.weight)}
                        className="rounded-md border border-[#3b1a00]/20 p-1 hover:bg-[#fff8f0]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => remove(item.id, item.weight)}
                        className="ml-auto rounded-md p-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-[#3b1a00]/10 bg-white px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-[#3b1a00]/70">Subtotal</span>
              <span className="font-semibold">{formatPKR(subtotal)}</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-semibold">Total</span>
              <span className="font-display text-xl font-bold text-[#c8860a]">{formatPKR(subtotal)}</span>
            </div>
            <Link
              to="/cart"
              onClick={close}
              className="block w-full rounded-lg bg-[#c8860a] py-3 text-center text-sm font-bold text-[#1a0a00] hover:brightness-110"
            >
              Proceed to Checkout
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
}
