import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, Minus, Plus, Trash2, Printer, Eye } from "lucide-react";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { EmptyState } from "@/components/EmptyState";
import { products, sales as seedSales, type Sale } from "@/data/mockData";
import { formatPKR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/sales")({ component: SalesPage });

interface CartItem { productId: string; name: string; qty: number; price: number; unit: string; }

function SalesPage() {
  const [tab, setTab] = useState<"new" | "history">("new");
  const [list, setList] = useState<Sale[]>(seedSales);

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit shadow-sm">
        {(["new", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-4 py-2 text-sm font-medium ${tab === t ? "bg-amber-brand text-amber-brand-foreground" : "text-walnut hover:bg-cream"}`}>
            {t === "new" ? "New Sale" : "Sales History"}
          </button>
        ))}
      </div>
      {tab === "new"
        ? <NewSale onComplete={(s) => { setList((l) => [s, ...l]); toast.success(`Sale completed — ${s.invoice}`); }} />
        : <History list={list} />}
    </div>
  );
}

function NewSale({ onComplete }: { onComplete: (s: Sale) => void }) {
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(5);
  const [payment, setPayment] = useState<"Cash" | "Credit" | "Bank Transfer">("Cash");
  const [received, setReceived] = useState(0);

  const subtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const tax = (subtotal - discount) * taxRate / 100;
  const total = subtotal - discount + tax;
  const change = received - total;

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const add = (p: typeof products[number]) => {
    if (p.stock === 0) return;
    setCart((c) => {
      const ex = c.find((x) => x.productId === p.id);
      // kg mein 0.5 increment, gram mein 100g increment, baqi mein 1
      const increment = p.unit === "kg" ? 0.5 : p.unit === "g" ? 100 : 1;
      if (ex) return c.map((x) => (x.productId === p.id ? { ...x, qty: x.qty + increment } : x));
      return [...c, { productId: p.id, name: p.name, qty: increment, price: p.sellPrice, unit: p.unit }];
    });
  };

  const setQty = (id: string, delta: number) => {
    const item = cart.find((x) => x.productId === id);
    if (!item) return;
    // kg mein 0.5 increment, gram mein 100g increment, baqi mein 1
    const increment = item.unit === "kg" ? 0.5 : item.unit === "g" ? 100 : 1;
    setCart((c) => c.map((x) => x.productId === id ? { ...x, qty: Math.max(increment, x.qty + (delta * increment)) } : x));
  };

  const complete = () => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      invoice: `INV-${Math.floor(Math.random() * 9000) + 2000}`,
      date: new Date().toISOString().slice(0, 10),
      customer: customer || "Walk-in Customer",
      customerPhone: phone || undefined,
      items: cart, subtotal, discount, tax, total,
      payment,
      status: payment === "Credit" ? "Credit" : "Paid",
    };
    onComplete(sale);
    setCart([]); setCustomer(""); setPhone(""); setDiscount(0); setReceived(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
          {filtered.map((p) => {
            const out = p.stock === 0;
            return (
              <button key={p.id} disabled={out} onClick={() => add(p)} className={`rounded-xl border border-border bg-cream/40 p-3 text-left transition ${out ? "opacity-40 cursor-not-allowed" : "hover:border-amber-brand hover:shadow-md hover:bg-card"}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-brand/10 text-amber-brand text-sm font-semibold mb-2">{p.name[0]}</div>
                <p className="text-sm font-medium text-walnut leading-tight line-clamp-2">{p.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-walnut">{formatPKR(p.sellPrice)}</p>
                  <Pill tone={out ? "danger" : p.stock < p.minStock ? "amber" : "success"}>{out ? "0" : p.stock} {p.unit}</Pill>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 shadow-sm sticky top-20 self-start">
        <h3 className="font-display text-lg font-semibold text-walnut mb-3">Invoice</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name" className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 mb-3 pr-1">
          {cart.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">Cart khaali hai</p>}
          {cart.map((c) => (
            <div key={c.productId} className="flex items-center gap-2 rounded-lg bg-cream/60 p-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-walnut truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">{formatPKR(c.price)} × {c.qty} {c.unit}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setQty(c.productId, -1)} className="rounded-md border border-border p-1 text-walnut hover:bg-cream"><Minus className="h-3 w-3" /></button>
                <input
                  type="number"
                  value={c.qty}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 0) {
                      setCart((cc) => cc.map((x) => x.productId === c.productId ? { ...x, qty: val } : x));
                    }
                  }}
                  onBlur={(e) => {
                    // Agar empty ya 0 hai toh minimum value set karo
                    const val = Number(e.target.value);
                    if (!val || val <= 0) {
                      const minVal = c.unit === "kg" ? 0.5 : c.unit === "g" ? 50 : 1;
                      setCart((cc) => cc.map((x) => x.productId === c.productId ? { ...x, qty: minVal } : x));
                    }
                  }}
                  className="w-16 text-center text-sm font-medium text-walnut tabular-nums border border-border rounded px-1 py-0.5 focus:outline-none focus:border-amber-brand focus:ring-1 focus:ring-amber-brand"
                  placeholder={c.unit}
                />
                <button onClick={() => setQty(c.productId, 1)} className="rounded-md border border-border p-1 text-walnut hover:bg-cream"><Plus className="h-3 w-3" /></button>
              </div>
              <p className="w-20 text-right text-sm font-medium text-walnut tabular-nums">{formatPKR(c.qty * c.price)}</p>
              <button onClick={() => setCart((cc) => cc.filter((x) => x.productId !== c.productId))} className="text-destructive p-1 hover:bg-destructive/10 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-border pt-3 text-sm">
          <Row label="Subtotal" value={formatPKR(subtotal)} />
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Discount</span>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} className="w-24 rounded-md border border-border bg-card px-2 py-1 text-right text-sm" />
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Tax (%)</span>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)} className="w-24 rounded-md border border-border bg-card px-2 py-1 text-right text-sm" />
          </div>
          <Row label="Grand Total" value={formatPKR(total)} bold />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg border border-border p-1 bg-cream/40">
          {(["Cash", "Credit", "Bank Transfer"] as const).map((m) => (
            <button key={m} onClick={() => setPayment(m)} className={`rounded-md py-1.5 text-xs font-medium ${payment === m ? "bg-walnut text-cream" : "text-walnut hover:bg-card"}`}>{m}</button>
          ))}
        </div>

        {payment === "Cash" && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <label className="text-xs text-muted-foreground">Received</label>
              <input type="number" value={received} onChange={(e) => setReceived(Number(e.target.value) || 0)} className="w-full rounded-md border border-border bg-card px-2 py-1.5 mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Change</label>
              <p className={`mt-1 px-2 py-1.5 rounded-md font-semibold tabular-nums ${change >= 0 ? "text-success bg-success/10" : "text-destructive bg-destructive/10"}`}>{formatPKR(Math.max(0, change))}</p>
            </div>
          </div>
        )}

        <button onClick={complete} className="mt-4 w-full rounded-lg bg-amber-brand py-2.5 text-sm font-semibold text-amber-brand-foreground hover:opacity-90">
          Complete Sale
        </button>
        <button className="mt-2 w-full rounded-lg border border-border py-2 text-sm font-medium text-walnut hover:bg-cream inline-flex items-center justify-center gap-2"><Printer className="h-4 w-4" /> Print Invoice</button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t border-border pt-2 text-base font-semibold text-walnut" : "text-muted-foreground"}`}>
      <span>{label}</span><span className="tabular-nums text-walnut">{value}</span>
    </div>
  );
}

function History({ list }: { list: Sale[] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [pay, setPay] = useState("All");
  const [status, setStatus] = useState("All");
  const [view, setView] = useState<Sale | null>(null);

  const filtered = useMemo(() => list.filter((s) => {
    if (q && !s.customer.toLowerCase().includes(q.toLowerCase()) && !s.invoice.toLowerCase().includes(q.toLowerCase())) return false;
    if (pay !== "All" && s.payment !== pay) return false;
    if (status !== "All" && s.status !== status) return false;
    if (from && new Date(s.date) < new Date(from)) return false;
    if (to && new Date(s.date) > new Date(to)) return false;
    return true;
  }), [list, q, pay, status, from, to]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice/customer" className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        <select value={pay} onChange={(e) => setPay(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <option>All</option><option>Cash</option><option>Credit</option><option>Bank Transfer</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <option>All</option><option>Paid</option><option>Credit</option><option>Returned</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-xs uppercase text-muted-foreground"><tr>
              <th className="text-left p-3">Invoice#</th><th className="text-left p-3">Date</th><th className="text-left p-3">Customer</th>
              <th className="text-right p-3">Items</th><th className="text-right p-3">Subtotal</th><th className="text-right p-3">Disc</th>
              <th className="text-right p-3">Tax</th><th className="text-right p-3">Total</th><th className="text-left p-3">Payment</th>
              <th className="text-left p-3">Status</th><th className="text-right p-3">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-cream/40">
                  <td className="p-3 font-medium text-walnut">{s.invoice}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(s.date)}</td>
                  <td className="p-3">{s.customer}</td>
                  <td className="p-3 text-right">{s.items.length}</td>
                  <td className="p-3 text-right tabular-nums">{formatPKR(s.subtotal)}</td>
                  <td className="p-3 text-right tabular-nums">{formatPKR(s.discount)}</td>
                  <td className="p-3 text-right tabular-nums">{formatPKR(s.tax)}</td>
                  <td className="p-3 text-right font-medium text-walnut">{formatPKR(s.total)}</td>
                  <td className="p-3 text-muted-foreground">{s.payment}</td>
                  <td className="p-3"><Pill tone={s.status === "Paid" ? "success" : s.status === "Credit" ? "amber" : "danger"}>{s.status}</Pill></td>
                  <td className="p-3 text-right">
                    <button onClick={() => setView(s)} className="rounded-md p-1.5 text-info hover:bg-info/10"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState title="No sales found" />}
        </div>
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title={`Invoice ${view?.invoice ?? ""}`} size="lg"
        footer={<><button onClick={() => window.print()} className="rounded-lg bg-walnut px-4 py-2 text-sm font-medium text-cream hover:opacity-90 inline-flex items-center gap-2"><Printer className="h-4 w-4" /> Print</button><button onClick={() => setView(null)} className="rounded-lg border border-border px-4 py-2 text-sm">Close</button></>}>
        {view && (
          <div className="print-area">
            <div className="text-center border-b border-border pb-4">
              <p className="font-display text-2xl font-bold text-walnut">DryFruit Pro</p>
              <p className="text-xs text-muted-foreground">Akbari Mandi, Lahore | +92 300 1234567</p>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Invoice #</p><p className="font-medium text-walnut">{view.invoice}</p></div>
              <div className="text-right"><p className="text-xs text-muted-foreground">Date</p><p className="font-medium text-walnut">{formatDate(view.date)}</p></div>
              <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium text-walnut">{view.customer}</p>{view.customerPhone && <p className="text-xs">{view.customerPhone}</p>}</div>
              <div className="text-right"><p className="text-xs text-muted-foreground">Payment</p><p className="font-medium text-walnut">{view.payment}</p></div>
            </div>
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-cream"><tr><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Price</th><th className="text-right p-2">Total</th></tr></thead>
              <tbody>{view.items.map((it, i) => (
                <tr key={i} className="border-t border-border"><td className="p-2">{it.name}</td><td className="p-2 text-right">{it.qty} {it.unit || 'pcs'}</td><td className="p-2 text-right">{formatPKR(it.price)}</td><td className="p-2 text-right">{formatPKR(it.qty * it.price)}</td></tr>
              ))}</tbody>
            </table>
            <div className="ml-auto w-64 mt-4 space-y-1 text-sm">
              <Row label="Subtotal" value={formatPKR(view.subtotal)} />
              <Row label="Discount" value={`- ${formatPKR(view.discount)}`} />
              <Row label="Tax" value={formatPKR(view.tax)} />
              <Row label="Grand Total" value={formatPKR(view.total)} bold />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t border-border">Shukriya for your business — Aap ka muamal, hamare haath mein.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
