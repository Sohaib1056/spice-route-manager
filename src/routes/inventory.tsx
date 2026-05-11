import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { Plus, Pencil, Trash2, Package, AlertTriangle, XCircle, DollarSign, Eye, MapPin, Clock, Info, ShieldCheck } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatCard } from "@/components/StatCard";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { SearchInput } from "@/components/SearchInput";
import { EmptyState } from "@/components/EmptyState";
import { formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { store, type Product } from "@/lib/store";

// --- Types & Constants ---

type Category = "Nuts" | "Dried Fruits" | "Seeds" | "Spices";

const categoryTone: Record<Category, "amber" | "pistachio" | "info" | "walnut"> = {
  Nuts: "amber", "Dried Fruits": "pistachio", Seeds: "info", Spices: "walnut",
};

interface FormVals {
  name: string; 
  sku: string; 
  category: Category; 
  unit: "kg" | "g" | "pack";
  buyPrice: number; 
  sellPrice: number; 
  stock: number; 
  minStock: number; 
  active: boolean; 
  description?: string;
  image?: string;
  discountPercentage?: number;
  shelfLife?: string;
  storageInfo?: string;
  imageFile?: FileList;
}

// --- Sub-components ---

function ProductDetailsModal({ open, product, onClose }: { open: boolean; product?: Product; onClose: () => void }) {
  if (!product) return null;

  const margin = product.sellPrice - product.buyPrice;
  const marginPct = (margin / (product.buyPrice || 1)) * 100;

  return (
    <Modal open={open} onClose={onClose} title="Product Details" size="lg">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start gap-6 pb-6 border-b border-border">
          <div className="h-24 w-24 rounded-2xl border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
            {product.image ? (
              <img 
                src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${product.image}`} 
                alt={product.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl">🥜</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-walnut">{product.name}</h2>
              <Pill tone={categoryTone[product.category as Category]}>{product.category}</Pill>
            </div>
            <p className="text-muted-foreground font-mono text-sm mb-2">{product.sku}</p>
            <div className="flex flex-wrap gap-2">
              <Pill tone={product.active ? "success" : "muted"}>{product.active ? "Active" : "Inactive"}</Pill>
              {product.stock <= product.minStock && (
                <Pill tone="danger">Low Stock Alert</Pill>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Inventory & Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Current Stock</p>
                <p className="text-lg font-bold text-walnut">{product.stock} {product.unit}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Min Level</p>
                <p className="text-lg font-bold text-walnut">{product.minStock} {product.unit}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Buy Price</p>
                <p className="text-lg font-bold text-walnut">{formatPKR(product.buyPrice)}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Sell Price</p>
                <p className="text-lg font-bold text-walnut">{formatPKR(product.sellPrice)}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-success/5 border border-success/20">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-success">Expected Margin</p>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">{formatPKR(margin)}</p>
                  <p className="text-xs text-success/70">{marginPct.toFixed(1)}% profit margin</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Website Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <Clock className="w-4 h-4 text-info" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Shelf Life</p>
                  <p className="text-sm font-semibold">{product.shelfLife || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <Info className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Storage Info</p>
                  <p className="text-sm font-semibold">{product.storageInfo || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <DollarSign className="w-4 h-4 text-success" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Discount</p>
                  <p className="text-sm font-semibold">{product.discountPercentage ? `${product.discountPercentage}% OFF` : 'No discount'}</p>
                </div>
              </div>
            </div>
            {product.description && (
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Description</p>
                <p className="text-sm text-walnut italic">"{product.description}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
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

function ProductModal({ open, editing, onClose, onSave }: { open: boolean; editing?: Product; onClose: () => void; onSave: (v: FormVals) => void }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormVals>({
    defaultValues: editing
      ? { ...editing as any }
      : { name: "", sku: `SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`, category: "Nuts", unit: "kg", buyPrice: 0, sellPrice: 0, stock: 0, minStock: 10, active: true, description: "", image: "", discountPercentage: 0, shelfLife: "", storageInfo: "" },
  });

  const selectedImage = watch("imageFile");

  // Reset form when editing changes or modal opens/closes
  useEffect(() => {
    if (open) {
      reset(editing 
        ? { ...editing as any } 
        : { name: "", sku: `SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`, category: "Nuts", unit: "kg", buyPrice: 0, sellPrice: 0, stock: 0, minStock: 10, active: true, description: "", image: "", discountPercentage: 0, shelfLife: "", storageInfo: "" }
      );
    }
  }, [open, editing, reset]);

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
        <Field label="Product Name" error={errors.name?.message} className="md:col-span-2">
          <input {...register("name", { required: "Product name is required" })} className="input" placeholder="e.g. Almonds" />
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
        <Field label="Weight Options (comma separated)" className="md:col-span-2">
          <input {...register("weightOptions")} className="input" placeholder="250g, 500g, 1kg" />
        </Field>
        <Field label="Shelf Life (e.g. 6 Months)">
          <input {...register("shelfLife")} className="input" placeholder="6 Months" />
        </Field>
        <Field label="Storage Info (e.g. Keep in cool place)">
          <input {...register("storageInfo")} className="input" placeholder="Keep in cool place" />
        </Field>
        <Field label="Upload Product Image" className="md:col-span-2">
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              {...register("imageFile")} 
              accept="image/*"
              className="input flex-1" 
            />
            {(selectedImage?.[0] || editing?.image) && (
              <div className="h-10 w-10 rounded-lg border border-border overflow-hidden bg-muted">
                <img 
                  src={selectedImage?.[0] ? URL.createObjectURL(selectedImage[0]) : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${editing?.image}`} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </Field>
        <Field label="Discount Percentage (%)">
          <input type="number" {...register("discountPercentage", { valueAsNumber: true })} className="input" placeholder="e.g. 10" />
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

// --- Main Component ---

export default function InventoryPage() {
  const [list, setList] = useState<Product[]>(store.getProducts());
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [sort, setSort] = useState<string>("name");
  const [modal, setModal] = useState<{ open: boolean; editing?: Product }>({ open: false });
  const [viewModal, setViewModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string }>({
    open: false,
    id: "",
  });

  useEffect(() => {
    setList(store.getProducts());

    // Listen for real-time stock updates
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || "https://spice-route-manager-production.up.railway.app");
    
    socket.on("stock-update", async () => {
      console.log("[InventoryPage] Stock update received, refreshing data...");
      await store.init();
      setList([...store.getProducts()]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
    setConfirmState({ open: true, id });
  };

  const doDelete = async (id: string) => {
    const toastId = toast.loading("Deleting product...");
    try {
      await store.deleteProduct(id);
      setList([...store.getProducts()]);
      toast.success("Product deleted successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete product", { id: toastId });
    }
  };

  const handleSave = async (vals: FormVals) => {
    try {
      const { imageFile, weightOptions, ...productData } = vals;
      const file = imageFile?.[0];

      // Convert comma separated string to array
      const weights = typeof weightOptions === 'string' 
        ? weightOptions.split(',').map(w => w.trim()).filter(w => w !== "")
        : weightOptions;

      const finalData = { ...productData, weightOptions: weights };

      if (modal.editing) {
        await store.updateProduct(modal.editing.id, finalData, file);
        toast.success("Product updated");
      } else {
        await store.addProduct(finalData as any, file);
        toast.success("Product added");
      }
      setList([...store.getProducts()]);
      setModal({ open: false });
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
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
            <option value="stock">Sort: Stock (low ? high)</option>
            <option value="price">Sort: Price (high ? low)</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-cream/90 backdrop-blur text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left font-bold px-4 py-3.5">Product</th>
                <th className="text-left font-bold px-4 py-3.5">SKU</th>
                <th className="text-left font-bold px-4 py-3.5">Category</th>
                <th className="text-right font-bold px-4 py-3.5">Buy Price</th>
                <th className="text-right font-bold px-4 py-3.5">Sell Price</th>
                <th className="text-right font-bold px-4 py-3.5">Margin</th>
                <th className="text-left font-bold px-4 py-3.5">Stock Status</th>
                <th className="text-left font-bold px-4 py-3.5">Status</th>
                <th className="text-right font-bold px-4 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const pct = Math.min(100, (p.stock / Math.max(p.minStock * 2, 1)) * 100);
                const ok = p.stock >= p.minStock;
                const outOfStock = p.stock === 0;
                const margin = p.sellPrice - p.buyPrice;
                const marginPct = (margin / (p.buyPrice || 1)) * 100;

                return (
                  <tr key={p.id} className="border-t border-border/50 hover:bg-cream/40 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm transition-transform group-hover:scale-110",
                          categoryTone[p.category as Category] === "amber" ? "bg-amber-brand/10 text-amber-brand" :
                          categoryTone[p.category as Category] === "pistachio" ? "bg-pistachio/10 text-pistachio" :
                          categoryTone[p.category as Category] === "info" ? "bg-info/10 text-info" : "bg-walnut/10 text-walnut"
                        )}>
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-walnut">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{p.unit} unit</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground font-mono text-xs tracking-tighter">{p.sku}</td>
                    <td className="px-4 py-4"><Pill tone={categoryTone[p.category as Category]}>{p.category}</Pill></td>
                    <td className="px-4 py-4 text-right tabular-nums text-muted-foreground">{formatPKR(p.buyPrice)}</td>
                    <td className="px-4 py-4 text-right tabular-nums font-bold text-walnut">{formatPKR(p.sellPrice)}</td>
                    <td className="px-4 py-4 text-right">
                      <p className={cn("text-xs font-bold", margin > 0 ? "text-success" : "text-destructive")}>
                        {margin > 0 ? "+" : ""}{formatPKR(margin)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">{marginPct.toFixed(1)}%</p>
                    </td>
                    <td className="px-4 py-4 min-w-[140px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-xs font-bold tabular-nums", ok ? "text-success" : outOfStock ? "text-destructive" : "text-warning")}>
                          {p.stock} in stock
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">Min: {p.minStock}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-cream overflow-hidden">
                        <div className={cn(
                          "h-full transition-all duration-500",
                          ok ? "bg-success" : outOfStock ? "bg-destructive" : "bg-warning"
                        )} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Pill tone={p.active ? "success" : "muted"}>{p.active ? "Active" : "Inactive"}</Pill>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewModal({ open: true, product: p })} className="rounded-lg p-2 text-info hover:bg-info/10 transition-colors" title="View Details"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => setModal({ open: true, editing: p })} className="rounded-lg p-2 text-amber-brand hover:bg-amber-brand/10 transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => onDelete(p.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
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
        onSave={handleSave}
      />

      <ProductDetailsModal
        open={viewModal.open}
        product={viewModal.product}
        onClose={() => setViewModal({ open: false })}
      />

      <ConfirmDialog
        open={confirmState.open}
        title="Delete Product"
        message="Are you sure you want to delete this product? All associated data will be lost."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          setConfirmState({ open: false, id: "" });
          doDelete(confirmState.id);
        }}
        onCancel={() => setConfirmState({ open: false, id: "" })}
      />
    </div>
  );
}
