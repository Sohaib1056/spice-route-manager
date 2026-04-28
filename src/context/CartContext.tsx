import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  weight?: string;
  image?: string;
}

interface CartCtx {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string, weight?: string) => void;
  setQty: (id: string, qty: number, weight?: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartCtx | null>(null);
const STORAGE_KEY = "dryfruitpro:cart";
const keyOf = (id: string, weight?: string) => `${id}::${weight ?? ""}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (item: CartItem) => {
    setItems((prev) => {
      const k = keyOf(item.id, item.weight);
      const idx = prev.findIndex((p) => keyOf(p.id, p.weight) === k);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
  };
  const remove = (id: string, weight?: string) =>
    setItems((prev) => prev.filter((p) => keyOf(p.id, p.weight) !== keyOf(id, weight)));
  const setQty = (id: string, qty: number, weight?: string) =>
    setItems((prev) =>
      prev.map((p) =>
        keyOf(p.id, p.weight) === keyOf(id, weight) ? { ...p, qty: Math.max(1, qty) } : p
      )
    );
  const clear = () => setItems([]);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      add,
      remove,
      setQty,
      clear,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [items, isOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
