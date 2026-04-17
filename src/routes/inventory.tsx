import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Package, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { SearchInput } from "@/components/SearchInput";
import { EmptyState } from "@/components/EmptyState";
import { products as seed, type Product, type Category } from "@/data/mockData";
import { formatPKR } from "@/lib/format";

export const Route = createFileRoute("/inventory")({ component: InventoryPage });

const categoryTone: Record<Category, "amber" | "pistachio" | "info" | "walnut"> = {
  Nuts: "amber", "Dried Fruits": "pistachio", Seeds: "info", Spices: "walnut",
};

interface FormVals {
  name: string; sku: string; category: Category; unit: "kg" | "g" | "pack";
  buyPrice: number; sellPrice: number; stock: number; minStock: number; active: boolean; description?: string;
}

function InventoryPage() {
  const [list, setList] = useState<Product[]>(seed);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [sort, setSort] = useState<string>("name");
  const [modal, setModal] = useState<{ open: boolean; editing?: Product }>({ open: false });

  const filtered = useMemo(() => {
    let r = list.filter((p) =>
      (cat === "All" || p.category === cat) &&
      (status === "All" || (status === "Active" ? p.active : !p.active)) &&
      (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()))
    );
    if (sort === "name") r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "stock") r = [...r].sort((a, b) => a.stock - b.stock);
    if (sort === "price") r = [...r].sort((a, b) => b.sellPrice - a.sellPrice);
    return r;
  }, [list, q, cat, status, sort]);

  const totalValue = list.reduce((s, p) => s + p.stock * p.buyPrice, 0);
  const low = list.filter((p) => p.stock > 0 && p.stock < p.minStock).length;
  const out = list.filter((p) => p.stock === 0).length;

  const onDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setList((l) => l.filter((p) => p.id !== id));
    toast.success("Product deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Manage all your dry fruit inventory in one place.</p>
        <button
          onClick={() => setModal({ open: true })}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={list.length} icon={<Package className="h-5 w-5" />} tone="walnut" />
        <StatCard label="Total Value" value={formatPKR(totalValue)} icon={<DollarSign className="h-5 w-5" />} tone="amber" />
        <StatCard label="Low Stock" value={low} icon={<AlertTriangle className="h-5 w-5" />} tone="info" />
        <StatCard label="Out of Stock" value={out} icon={<XCircle className="h-5 w-5" />} tone="danger" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search by name or SKU..." />
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <option>All</option><option>Nuts</option><option>Dried Fruits</option><option>Seeds</option><option>Spices</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <option>All</option><option>Active</option><option>Inactive</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <option value="name">Sort: Name</option>
            <option value="stock">Sort: Stock (low → high)</option>
            <option value="price">Sort: Price (high → low)</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">#</th>
                <th className="text-left font-medium px-4 py-3">Product</th>
                <th className="text-left font-medium px-4 py-3">SKU</th>
                <th className="text-left font-medium px-4 py-3">Category</th>
                <th className="text-left font-medium px-4 py-3">Unit</th>
                <th className="text-right font-medium px-4 py-3">Buy</th>
                <th className="text-right font-medium px-4 py-3">Sell</th>
                <th className="text-left font-medium px-4 py-3">Stock</th>
                <th className="text-right font-medium px-4 py-3">Min</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const pct = Math.min(100, (p.stock / Math.max(p.minStock * 3, 1)) * 100);
                const ok = p.stock >= p.minStock;
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-cream/40">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-walnut">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.urdu}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3"><Pill tone={categoryTone[p.category]}>{p.category}</Pill></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.unit}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPKR(p.buyPrice)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-walnut">{formatPKR(p.sellPrice)}</td>
                    <td className="px-4 py-3 min-w-[120px]">
                      <p className="text-sm font-medium text-walnut">{p.stock}</p>
                      <div className="mt-1 h-1.5 rounded-full bg-cream overflow-hidden">
                        <div className={`h-full ${ok ? "bg-success" : p.stock === 0 ? "bg-destructive" : "bg-warning"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{p.minStock}</td>
                    <td className="px-4 py-3"><Pill tone={p.active ? "success" : "muted"}>{p.active ? "Active" : "Inactive"}</Pill></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setModal({ open: true, editing: p })} className="rounded-md p-1.5 text-amber-brand hover:bg-amber-brand/10" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => onDelete(p.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState title="No products found" subtitle="Filter ya search badal kar dobara try karein." />}
        </div>
      </div>

      <ProductModal
        open={modal.open}
        editing={modal.editing}
        onClose={() => setModal({ open: false })}
        onSave={(vals) => {
          if (modal.editing) {
            setList((l) => l.map((p) => (p.id === modal.editing!.id ? { ...p, ...vals } : p)));
            toast.success("Product updated");
          } else {
            const id = `p${Date.now()}`;
            setList((l) => [{ id, urdu: "", ...vals } as Product, ...l]);
            toast.success("Product added");
          }
          setModal({ open: false });
        }}
      />
    </div>
  );
}

function ProductModal({ open, editing, onClose, onSave }: { open: boolean; editing?: Product; onClose: () => void; onSave: (v: FormVals) => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormVals>({
    values: editing
      ? { ...editing }
      : { name: "", sku: `DF-NEW-${Date.now().toString().slice(-4)}`, category: "Nuts", unit: "kg", buyPrice: 0, sellPrice: 0, stock: 0, minStock: 10, active: true, description: "" },
  });

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); reset(); }}
      title={editing ? "Edit Product" : "Add Product"}
      footer={
        <>
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted">Cancel</button>
          <button onClick={handleSubmit(onSave)} className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Save Product</button>
        </>
      }
    >
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Product Name" error={errors.name?.message}>
          <input {...register("name", { required: "Name is required" })} className="input" />
        </Field>
        <Field label="SKU"><input {...register("sku")} className="input" /></Field>
        <Field label="Category">
          <select {...register("category")} className="input">
            <option>Nuts</option><option>Dried Fruits</option><option>Seeds</option><option>Spices</option>
          </select>
        </Field>
        <Field label="Unit">
          <select {...register("unit")} className="input">
            <option>kg</option><option>g</option><option>pack</option>
          </select>
        </Field>
        <Field label="Purchase Price (PKR)"><input type="number" {...register("buyPrice", { valueAsNumber: true })} className="input" /></Field>
        <Field label="Selling Price (PKR)"><input type="number" {...register("sellPrice", { valueAsNumber: true })} className="input" /></Field>
        <Field label="Current Stock"><input type="number" {...register("stock", { valueAsNumber: true })} className="input" /></Field>
        <Field label="Min Stock Level"><input type="number" {...register("minStock", { valueAsNumber: true })} className="input" /></Field>
        <Field label="Description" className="md:col-span-2">
          <textarea {...register("description")} rows={3} className="input" />
        </Field>
        <label className="md:col-span-2 flex items-center gap-2">
          <input type="checkbox" {...register("active")} className="h-4 w-4 accent-[var(--color-amber-brand)]" />
          <span className="text-sm font-medium text-walnut">Active</span>
        </label>
      </form>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:8px 12px;font-size:14px;color:var(--color-foreground)}.input:focus{outline:none;border-color:var(--color-amber-brand);box-shadow:0 0 0 3px color-mix(in oklab, var(--color-amber-brand) 20%, transparent)}`}</style>
    </Modal>
  );
}

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
