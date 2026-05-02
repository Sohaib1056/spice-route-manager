import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, RefreshCw, RotateCcw, X } from "lucide-react";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { SearchInput } from "@/components/SearchInput";
import { EmptyState } from "@/components/EmptyState";
import { formatPKR, formatDateTime } from "@/lib/format";
import { store, type Product, type StockMovement } from "@/lib/store";

// --- Sub-components ---

function Overview({ products, onAdjust }: { products: Product[]; onAdjust: (p: Product) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Product</th>
              <th className="text-left font-medium px-4 py-3">Category</th>
              <th className="text-left font-medium px-4 py-3">Unit</th>
              <th className="text-left font-medium px-4 py-3">Current Stock</th>
              <th className="text-right font-medium px-4 py-3">Stock Value</th>
              <th className="text-right font-medium px-4 py-3">Min Level</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const pct = Math.min(100, (p.stock / Math.max(p.minStock * 3, 1)) * 100);
              const ok = p.stock >= p.minStock;
              const tone = p.stock === 0 ? "danger" : ok ? "success" : "warning";
              return (
                <tr key={p.id} className="border-t border-border hover:bg-cream/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-walnut">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.unit}</td>
                  <td className="px-4 py-3 min-w-[160px]">
                    <p className="font-medium text-walnut">{p.stock} {p.unit}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-cream overflow-hidden">
                      <div className={`h-full ${tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-warning" : "bg-success"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-walnut">{formatPKR(p.stock * p.buyPrice)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.minStock}</td>
                  <td className="px-4 py-3">
                    <Pill tone={tone}>{p.stock === 0 ? "Out of Stock" : ok ? "In Stock" : "Low"}</Pill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onAdjust(p)} className="rounded-md border border-amber-brand/40 px-3 py-1.5 text-xs font-medium text-amber-brand hover:bg-amber-brand/10">
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function History({ movements }: { movements: StockMovement[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    console.log("[StockPage] Filtering movements:", movements.length);
    const result = movements.filter((m) => {
      if (type !== "All" && m.type !== type) return false;
      if (q && !m.productName.toLowerCase().includes(q.toLowerCase())) return false;
      
      const moveDate = new Date(m.date);
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        if (moveDate < fromDate) return false;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        if (moveDate > toDate) return false;
      }
      return true;
    });
    console.log("[StockPage] Filtered result:", result.length);
    return result;
  }, [movements, q, type, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const typeMeta: Record<string, { tone: "success" | "danger" | "amber" | "info" | "muted"; icon: React.ReactNode }> = {
    In:         { tone: "success", icon: <ArrowUp className="h-3 w-3" /> },
    Out:        { tone: "danger",  icon: <ArrowDown className="h-3 w-3" /> },
    Adjustment: { tone: "amber",   icon: <RefreshCw className="h-3 w-3" /> },
    Return:     { tone: "info",    icon: <RotateCcw className="h-3 w-3" /> },
    Damaged:    { tone: "muted",   icon: <X className="h-3 w-3" /> },
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search product..." />
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <option>All</option><option>In</option><option>Out</option><option>Adjustment</option><option>Return</option><option>Damaged</option>
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Date/Time</th>
                <th className="text-left font-medium px-4 py-3">Product</th>
                <th className="text-left font-medium px-4 py-3">Type</th>
                <th className="text-right font-medium px-4 py-3">Qty</th>
                <th className="text-right font-medium px-4 py-3">Prev</th>
                <th className="text-right font-medium px-4 py-3">New</th>
                <th className="text-left font-medium px-4 py-3">Reason</th>
                <th className="text-left font-medium px-4 py-3">Done By</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((m) => {
                const meta = typeMeta[m.type];
                return (
                  <tr key={m.id} className="border-t border-border hover:bg-cream/40">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(m.date)}</td>
                    <td className="px-4 py-3 font-medium text-walnut">{m.productName}</td>
                    <td className="px-4 py-3"><Pill tone={meta.tone}>{meta.icon} {m.type}</Pill></td>
                    <td className="px-4 py-3 text-right tabular-nums">{m.qty}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{m.prevStock}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-walnut">{m.newStock}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.reason}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.doneBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {slice.length === 0 && <EmptyState title="No movements found" />}
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">Showing {(page - 1) * perPage + 1}û{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border border-border px-3 py-1 text-sm hover:bg-cream disabled:opacity-50">Prev</button>
              {Array.from({ length: pages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`rounded-md px-3 py-1 text-sm ${page === i + 1 ? "bg-amber-brand text-amber-brand-foreground" : "border border-border hover:bg-cream"}`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="rounded-md border border-border px-3 py-1 text-sm hover:bg-cream disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdjustModal({ product, onClose, onSave }: { product: Product | null; onClose: () => void; onSave: (qty: number, reason: string) => void }) {
  const { register, handleSubmit, reset } = useForm<{ qty: number; reason: string }>({
    values: { qty: product?.stock ?? 0, reason: "" },
  });

  return (
    <Modal
      open={!!product}
      onClose={() => { onClose(); reset(); }}
      title="Adjust Stock"
      size="md"
      footer={
        <>
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted">Cancel</button>
          <button onClick={handleSubmit((v) => onSave(Number(v.qty), v.reason))} className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Save Adjustment</button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-cream/60 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Product</p>
          <p className="font-medium text-walnut">{product?.name}</p>
          <p className="text-xs text-muted-foreground mt-1">Current Stock: <span className="font-semibold text-walnut">{product?.stock} {product?.unit}</span></p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">New Quantity</label>
          <input type="number" {...register("qty", { valueAsNumber: true, required: true })} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</label>
          <textarea {...register("reason", { required: true })} rows={3} placeholder="e.g. Physical count, damaged stock, return..." className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        </div>
      </div>
    </Modal>
  );
}

// --- Main Component ---

export default function StockPage() {
  const [tab, setTab] = useState<"overview" | "history">("overview");
  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [movements, setMovements] = useState<StockMovement[]>(store.getMovements());
  const [adjusting, setAdjusting] = useState<Product | null>(null);

  useEffect(() => {
    const refreshData = async () => {
      try {
        await store.init();
        setProducts(store.getProducts());
        const moves = store.getMovements();
        console.log("[StockPage] Fetched movements:", moves);
        setMovements([...moves]); // Ensure a new array reference to trigger re-render
      } catch (error) {
        console.error("Failed to refresh stock data:", error);
      }
    };
    refreshData();
  }, [tab]);

  const handleAdjust = async (qty: number, reason: string) => {
    if (!adjusting) return;
    
    try {
      await store.adjustStock(adjusting.id, qty, reason);
      setProducts(store.getProducts());
      setMovements(store.getMovements());
      toast.success("Stock adjusted");
      setAdjusting(null);
    } catch (error) {
      toast.error("Failed to adjust stock");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit shadow-sm">
        {(["overview", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-amber-brand text-amber-brand-foreground" : "text-walnut hover:bg-cream"}`}
          >
            {t === "overview" ? "Stock Overview" : "Movement History"}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <Overview products={products} onAdjust={setAdjusting} />
      ) : (
        <History movements={movements} />
      )}

      <AdjustModal
        product={adjusting}
        onClose={() => setAdjusting(null)}
        onSave={handleAdjust}
      />
    </div>
  );
}
