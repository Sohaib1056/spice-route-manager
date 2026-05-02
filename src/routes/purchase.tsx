import { useMemo, useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Trash2, Eye, Pencil, CheckCircle2, Upload, FileText, X, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatCard } from "@/components/StatCard";
import { Modal } from "@/components/Modal";
import { EmptyState } from "@/components/EmptyState";
import { formatPKR, formatDate } from "@/lib/format";
import { store, type Purchase, type Product, type Supplier } from "@/lib/store";
import { TransactionRow, StatusPill } from "@/components/TransactionUtils";
import { useSettings } from "@/contexts/SettingsContext";

// --- Types ---

interface ReceiveData {
  receivedDate: string;
  supplierBill?: File;
  notes?: string;
}

interface POForm {
  supplierId: string;
  date: string;
  expectedDelivery: string;
  paymentTerms: string;
  items: { productId: string; qty: number; price: number; discount: number; unit?: string }[];
  taxRate: number;
  notes: string;
}

// --- Sub-components ---

function NewPOModal({ open, editing, onClose, onSave, products, suppliers, preSelectedProductId }: { 
  open: boolean; 
  editing?: Purchase;
  onClose: () => void; 
  onSave: (p: Omit<Purchase, "id">) => void; 
  products: Product[]; 
  suppliers: Supplier[];
  preSelectedProductId?: string;
}) {
  const { settings } = useSettings();
  const { register, control, handleSubmit, watch, reset, setValue } = useForm<POForm>({
    defaultValues: {
      supplierId: suppliers[0]?.id || "",
      date: new Date().toISOString().slice(0, 10),
      expectedDelivery: "",
      paymentTerms: "Net 30",
      items: [{ productId: products[0]?.id || "", qty: 1, price: products[0]?.buyPrice || 0, discount: 0 }],
      taxRate: settings?.defaultTax ?? 5,
      notes: "",
    },
  });

  useEffect(() => {
    if (editing) {
      const calculatedTax = (editing.tax / (editing.subtotal - editing.discount)) * 100;
      reset({
        supplierId: editing.supplierId,
        date: editing.date,
        expectedDelivery: "",
        paymentTerms: "Net 30",
        items: editing.items.map(item => ({
          productId: item.productId,
          qty: item.qty,
          price: item.price,
          discount: 0,
          unit: item.unit
        })),
        taxRate: calculatedTax || (settings?.defaultTax ?? 5),
        notes: "",
      });
    } else if (open && !editing) {
      let initialProduct = products[0];
      if (preSelectedProductId) {
        const foundProduct = products.find(p => p.id === preSelectedProductId || p._id === preSelectedProductId);
        if (foundProduct) {
          initialProduct = foundProduct;
        }
      }
      
      reset({
        supplierId: suppliers[0]?.id || "",
        date: new Date().toISOString().slice(0, 10),
        expectedDelivery: "",
        paymentTerms: "Net 30",
        items: [{ 
          productId: initialProduct?.id || "", 
          qty: initialProduct?.minStock || 100,
          price: initialProduct?.buyPrice || 0, 
          discount: 0 
        }],
        taxRate: settings?.defaultTax ?? 5,
        notes: preSelectedProductId ? "Reorder from Low Stock Alert" : "",
      });
    }
  }, [editing, open, reset, suppliers, products, settings, preSelectedProductId]);

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const taxRate = watch("taxRate");
  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const totalDiscount = items.reduce((s, it) => s + ((Number(it.qty) || 0) * (Number(it.price) || 0) * (Number(it.discount) || 0) / 100), 0);
  const tax = (subtotal - totalDiscount) * (Number(taxRate) || 0) / 100;
  const grand = subtotal - totalDiscount + tax;

  const submit = (vals: POForm, status: "Draft" | "Sent") => {
    try {
      const sup = suppliers.find((s) => s.id === vals.supplierId);
      if (!sup) {
        toast.error("Meherbani kar ke supplier select karein");
        return;
      }

      const po: Omit<Purchase, "id"> = {
        po: editing?.po || `PO-${Math.floor(Math.random() * 9000) + 3000}`,
        date: vals.date,
        supplierId: sup.id,
        supplierName: sup.name,
        items: vals.items.map((it) => {
          const p = products.find((x) => x.id === it.productId);
          if (!p) {
            throw new Error(`Product not found: ${it.productId}`);
          }
          return { 
            productId: p.id || (p as any)._id, 
            name: p.name, 
            qty: Number(it.qty) || 0, 
            price: Number(it.price) || 0, 
            unit: it.unit || p.unit || "pcs" 
          };
        }),
        subtotal, 
        discount: totalDiscount, 
        tax, 
        total: grand,
        status, 
        paymentStatus: editing?.paymentStatus || "Pending",
      };

      console.log("[PurchasePage] Submitting PO:", po);
      onSave(po);
      reset();
    } catch (err: any) {
      console.error("[PurchasePage] Submit preparation error:", err);
      toast.error(err.message || "Order submit karne mein masla aaya");
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); reset(); }}
      title={editing ? `Edit Purchase Order - ${editing.po}` : "New Purchase Order"}
      size="xl"
      footer={
        <>
          <button onClick={handleSubmit((v) => submit(v, "Draft"))} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted">Save as Draft</button>
          <button onClick={handleSubmit((v) => submit(v, "Sent"))} className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Submit Order</button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div><label className="lbl">Supplier</label><select {...register("supplierId")} className="input">{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label className="lbl">PO Date</label><input type="date" {...register("date")} className="input" /></div>
          <div><label className="lbl">Expected Delivery</label><input type="date" {...register("expectedDelivery")} className="input" /></div>
          <div><label className="lbl">Payment Terms</label><select {...register("paymentTerms")} className="input"><option>Cash</option><option>Net 15</option><option>Net 30</option><option>Net 60</option></select></div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-walnut">Items</p>
            <button onClick={() => append({ productId: products[0]?.id || "", qty: 1, price: products[0]?.buyPrice || 0, discount: 0 })} className="inline-flex items-center gap-1 rounded-md bg-pistachio/10 px-3 py-1.5 text-xs font-medium text-pistachio hover:bg-pistachio/20"><Plus className="h-3 w-3" /> Add Item</button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-cream/60 text-xs uppercase text-muted-foreground"><tr><th className="text-left p-2">Product</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Unit Price</th><th className="text-right p-2">Disc %</th><th className="text-right p-2">Total</th><th></th></tr></thead>
              <tbody>
                {fields.map((f, idx) => {
                  const it = items[idx];
                  const product = products.find((p) => p.id === it?.productId);
                  const total = (Number(it?.qty) || 0) * (Number(it?.price) || 0) * (1 - (Number(it?.discount) || 0) / 100);
                  return (
                    <tr key={f.id} className="border-t border-border">
                      <td className="p-2">
                        <Controller control={control} name={`items.${idx}.productId`} render={({ field }) => (
                          <select 
                            {...field} 
                            className="input"
                            onChange={(e) => {
                              field.onChange(e);
                              const selectedProduct = products.find(p => p.id === e.target.value);
                              if (selectedProduct) {
                                setValue(`items.${idx}.price`, selectedProduct.buyPrice);
                              }
                            }}
                          >
                            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                          </select>
                        )} />
                      </td>
                      <td className="p-2 w-28">
                        <input 
                          type="number" 
                          {...register(`items.${idx}.qty`, { valueAsNumber: true })} 
                          className="input text-right" 
                          placeholder={`in ${product?.unit || 'pcs'}`}
                        />
                      </td>
                      <td className="p-2 w-32"><input type="number" step="0.01" {...register(`items.${idx}.price`, { valueAsNumber: true })} className="input text-right" /></td>
                      <td className="p-2 w-20"><input type="number" step="0.1" {...register(`items.${idx}.discount`, { valueAsNumber: true })} className="input text-right" /></td>
                      <td className="p-2 text-right font-medium text-walnut tabular-nums w-32">{formatPKR(total)}</td>
                      <td className="p-2 w-10"><button type="button" onClick={() => remove(idx)} className="text-destructive hover:bg-destructive/10 rounded p-1"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="lbl">Notes</label><textarea {...register("notes")} rows={4} className="input" /></div>
          <div className="rounded-lg bg-cream/60 p-4 space-y-2 text-sm">
            <TransactionRow label="Subtotal" value={formatPKR(subtotal)} />
            <TransactionRow label="Discount" value={`- ${formatPKR(totalDiscount)}`} />
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Tax (%)</span>
              <input type="number" {...register("taxRate", { valueAsNumber: true })} className="input w-20 text-right" />
            </div>
            <TransactionRow label="Tax Amount" value={formatPKR(tax)} />
            <TransactionRow label="Grand Total" value={formatPKR(grand)} bold />
          </div>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:6px 10px;font-size:14px;color:var(--color-foreground)}.input:focus{outline:none;border-color:var(--color-amber-brand);box-shadow:0 0 0 3px color-mix(in oklab, var(--color-amber-brand) 20%, transparent)}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </Modal>
  );
}

function ReceiveOrderModal({ open, purchase, onClose, onReceive }: { open: boolean; purchase: Purchase | null; onClose: () => void; onReceive: (id: string, data: ReceiveData) => void }) {
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and PDF files are allowed");
        return;
      }
      setUploadedFile(file);
      toast.success("Bill selected successfully!");
    }
  };

  const handleSubmit = () => {
    if (!purchase) return;
    onReceive(purchase.id, { receivedDate, supplierBill: uploadedFile || undefined, notes: notes || undefined });
    setReceivedDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setUploadedFile(null);
  };

  if (!purchase) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Receive Order - ${purchase.po}`}
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted">Cancel</button>
          <button onClick={handleSubmit} className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:opacity-90">Confirm Receipt</button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-border bg-cream/40 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium text-walnut">{purchase.supplierName}</p></div>
            <div><p className="text-xs text-muted-foreground">PO Date</p><p className="font-medium text-walnut">{formatDate(purchase.date)}</p></div>
            <div><p className="text-xs text-muted-foreground">Items</p><p className="font-medium text-walnut">{purchase.items.length} items</p></div>
            <div><p className="text-xs text-muted-foreground">Total Amount</p><p className="font-medium text-walnut">{formatPKR(purchase.total)}</p></div>
          </div>
        </div>
        <div>
          <label className="lbl">Received Date</label>
          <input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} className="input" max={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <label className="lbl">Upload Supplier Bill/Invoice</label>
          <p className="text-xs text-muted-foreground mb-2">Upload the bill received from supplier (JPG, PNG, or PDF - Max 5MB)</p>
          {!uploadedFile ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-cream/40 hover:bg-cream/60 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-amber-brand">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF (MAX. 5MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/jpeg,image/jpg,image/png,application/pdf" onChange={handleFileUpload} />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success"><FileText className="h-5 w-5" /></div>
                <div><p className="text-sm font-medium text-walnut">{uploadedFile.name}</p><p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(2)} KB</p></div>
              </div>
              <button onClick={() => setUploadedFile(null)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></button>
            </div>
          )}
        </div>
        <div>
          <label className="lbl">Notes (Optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="input" placeholder="Any additional notes about the received goods..." />
        </div>
        <div>
          <p className="text-sm font-semibold text-walnut mb-2">Items to Receive</p>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream/60"><tr><th className="text-left p-2 text-xs uppercase text-muted-foreground">Item</th><th className="text-right p-2 text-xs uppercase text-muted-foreground">Qty</th></tr></thead>
              <tbody>
                {purchase.items.map((item, idx) => (
                  <tr key={idx} className="border-t border-border"><td className="p-2">{item.name}</td><td className="p-2 text-right font-medium">{item.qty} {item.unit || 'pcs'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:8px 12px;font-size:14px;color:var(--color-foreground)}.input:focus{outline:none;border-color:var(--color-amber-brand);box-shadow:0 0 0 3px color-mix(in oklab, var(--color-amber-brand) 20%, transparent)}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </Modal>
  );
}

// --- Main Component ---

export default function PurchasePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [list, setList] = useState<Purchase[]>(store.getPurchases());
  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [suppliers, setSuppliers] = useState<Supplier[]>(store.getSuppliers());
  const [tab, setTab] = useState<"po" | "grn">("po");
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [view, setView] = useState<Purchase | null>(null);
  const [receiveModal, setReceiveModal] = useState<Purchase | null>(null);
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string; poNumber: string }>({ open: false, id: "", poNumber: "" });

  useEffect(() => {
    const refreshData = async () => {
      try {
        await store.init();
        setList(store.getPurchases());
        setProducts(store.getProducts());
        setSuppliers(store.getSuppliers());
      } catch (error) {
        console.error("Failed to refresh purchase data:", error);
      }
    };

    // Refresh when tab changes or component mounts
    refreshData();

    // Set up an interval to refresh data every 30 seconds to keep payment status in sync
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [tab]);

  useEffect(() => {
    const productId = searchParams.get('product');
    if (productId && products.length > 0) {
      setShowForm(true);
    }
  }, [searchParams, products]);

  const stats = useMemo(() => {
    // Current month filter
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyList = list.filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    return {
      month: monthlyList.reduce((s, p) => s + p.total, 0),
      pending: list.filter((p) => p.status === "Sent").length,
      paid: list.filter((p) => p.paymentStatus === "Paid").reduce((s, p) => s + p.total, 0),
      duePayments: list.filter((p) => p.paymentStatus !== "Paid").reduce((s, p) => s + p.total, 0),
    };
  }, [list]);

  const handleSave = async (po: Omit<Purchase, "id">) => {
    try {
      if (editingPurchase) {
        await store.updatePurchase(editingPurchase.id, po);
        setEditingPurchase(null);
        toast.success("Purchase order updated");
      } else {
        await store.addPurchase(po);
        setSearchParams({});
        toast.success("Purchase order created");
      }
      setList(store.getPurchases());
      setProducts(store.getProducts());
      setShowForm(false);
    } catch (error) {
      toast.error(editingPurchase ? "Failed to update purchase order" : "Failed to create purchase order");
    }
  };

  const handleReceive = async (id: string, data: ReceiveData) => {
    const loadingToast = toast.loading("Confirming receipt and updating inventory...");
    try {
      await store.receivePurchase(id, data);
      
      // Strict re-initialization to ensure inventory and purchase lists are sync'd
      await store.init(); 
      
      // Update all relevant states to ensure UI reflects new stock
      setList(store.getPurchases());
      setProducts(store.getProducts());
      setSuppliers(store.getSuppliers());
      
      setReceiveModal(null);
      toast.success("Order received and inventory updated successfully!", { id: loadingToast, duration: 4000 });
      
      // Optional: Redirect to inventory if needed, but here we stay to see the updated PO list
    } catch (error: any) {
      console.error("[PurchasePage] Receive error details:", error);
      let errorMsg = "Failed to receive order. Please try again.";
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.message === "Validation Error" && data.details) {
          const fields = Object.keys(data.details).join(", ");
          errorMsg = `Validation failed for: ${fields}. Please check order data.`;
        } else {
          errorMsg = data.message || errorMsg;
        }
      }
      
      toast.error(errorMsg, { id: loadingToast, duration: 6000 });
    }
  };

  const handleDownload = (p: Purchase) => {
    const doc = new jsPDF();
    const primaryColor = [180, 83, 9]; // amber-brand
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("PURCHASE ORDER", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`PO Number: ${p.po}`, 14, 28);
    doc.text(`Date: ${formatDate(p.date)}`, 14, 33);
    doc.text(`Status: ${p.status}`, 14, 38);
    
    // Supplier Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("SUPPLIER:", 14, 50);
    doc.setFontSize(11);
    doc.text(p.supplierName, 14, 56);
    
    // Items Table
    autoTable(doc, {
      startY: 65,
      head: [["Item", "Quantity", "Price", "Total"]],
      body: p.items.map(it => [
        it.name,
        `${it.qty} ${it.unit || "pcs"}`,
        formatPKR(it.price),
        formatPKR(it.qty * it.price)
      ]),
      headStyles: { fillStyle: "f3", fillColor: primaryColor },
      alternateRowStyles: { fillColor: [252, 251, 247] }, // cream/40
    });
    
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatPKR(p.subtotal)}`, 140, finalY);
    doc.text(`Discount: -${formatPKR(p.discount)}`, 140, finalY + 5);
    doc.text(`Tax: ${formatPKR(p.tax)}`, 140, finalY + 10);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: ${formatPKR(p.total)}`, 140, finalY + 18);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text("Spice Route Manager - Generated on " + new Date().toLocaleString(), 14, doc.internal.pageSize.height - 10);
    
    doc.save(`${p.po}.pdf`);
    toast.success("Purchase order downloaded");
  };

  const doDelete = async (id: string) => {
    try {
      await store.deletePurchase(id);
      setList(store.getPurchases());
      setProducts(store.getProducts());
      toast.success("Purchase order deleted successfully");
    } catch (error) {
      toast.error("Failed to delete purchase order");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Track all purchase orders and goods received notes.</p>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New Purchase Order
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Purchases (Month)" value={formatPKR(stats.month)} tone="walnut" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Pending GRNs" value={stats.pending} tone="amber" icon={<Eye className="h-5 w-5" />} />
        <StatCard label="Total Paid" value={formatPKR(stats.paid)} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Total Pending" value={formatPKR(stats.duePayments)} tone="danger" icon={<Eye className="h-5 w-5" />} />
      </div>

      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit shadow-sm">
        {(["po", "grn"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-4 py-2 text-sm font-medium ${tab === t ? "bg-amber-brand text-amber-brand-foreground" : "text-walnut hover:bg-cream"}`}>
            {t === "po" ? "Purchase Orders" : "Received (GRN)"}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">{tab === "po" ? "PO#" : "GRN#"}</th>
                <th className="text-left font-medium px-4 py-3">Date</th>
                <th className="text-left font-medium px-4 py-3">Supplier</th>
                <th className="text-center font-medium px-4 py-3">Items</th>
                <th className="text-right font-medium px-4 py-3">Total</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Payment</th>
                {tab === "grn" && <th className="text-center font-medium px-4 py-3">Receipt</th>}
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(tab === "po" ? list : list.filter((p) => p.status === "Received")).map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-cream/40">
                  <td className="px-4 py-3 font-medium text-walnut">{tab === "po" ? p.po : p.po.replace("PO", "GRN")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.date)}</td>
                  <td className="px-4 py-3 font-medium">{p.supplierName}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{p.items.length}</td>
                  <td className="px-4 py-3 text-right font-medium text-walnut">{formatPKR(p.total)}</td>
                  <td className="px-4 py-3"><StatusPill type="purchase" status={p.status} /></td>
                  <td className="px-4 py-3"><StatusPill type="payment" status={p.paymentStatus} /></td>
                  {tab === "grn" && (
                    <td className="px-4 py-3 text-center">
                      {p.supplierBill ? (
                        <button 
                          onClick={() => p.supplierBill?.url && window.open(p.supplierBill.url, '_blank')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-brand/10 text-amber-brand hover:bg-amber-brand/20 transition-colors"
                          title="View Receipt"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setView(p)} className="rounded-md p-1.5 text-info hover:bg-info/10" aria-label="View"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleDownload(p)} className="rounded-md p-1.5 text-amber-brand hover:bg-amber-brand/10" aria-label="Download"><Download className="h-4 w-4" /></button>
                      {p.status !== "Received" && <button onClick={() => setReceiveModal(p)} className="rounded-md p-1.5 text-success hover:bg-success/10" aria-label="Receive"><CheckCircle2 className="h-4 w-4" /></button>}
                      {p.status !== "Received" && <button onClick={() => setEditingPurchase(p)} className="rounded-md p-1.5 text-amber-brand hover:bg-amber-brand/10" aria-label="Edit"><Pencil className="h-4 w-4" /></button>}
                      <button onClick={() => setConfirmState({ open: true, id: p.id, poNumber: p.po })} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <EmptyState />}
        </div>
      </div>

      <NewPOModal open={showForm || !!editingPurchase} editing={editingPurchase || undefined} onClose={() => { setShowForm(false); setEditingPurchase(null); }} onSave={handleSave} products={products} suppliers={suppliers} preSelectedProductId={searchParams.get('product') || undefined} />

      <Modal open={!!view} onClose={() => setView(null)} title={`Purchase Order - ${view?.po ?? ""}`} size="xl">
        {view && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium text-walnut">{view.supplierName}</p></div>
              <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium text-walnut">{formatDate(view.date)}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><StatusPill type="purchase" status={view.status} /></div>
              {view.receivedDate && <div><p className="text-xs text-muted-foreground">Received Date</p><p className="font-medium text-walnut">{formatDate(view.receivedDate)}</p></div>}
            </div>
            {view.supplierBill && (
              <div className="rounded-lg border border-border bg-cream/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-brand/10 text-amber-brand"><FileText className="h-5 w-5" /></div>
                    <div><p className="text-sm font-medium text-walnut">Supplier Bill Uploaded</p><p className="text-xs text-muted-foreground">{view.supplierBill.name}</p></div>
                  </div>
                  <button onClick={() => view.supplierBill?.url && window.open(view.supplierBill.url, '_blank')} className="text-sm text-info hover:underline">View</button>
                </div>
              </div>
            )}
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-cream"><tr><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Price</th><th className="text-right p-2">Total</th></tr></thead>
              <tbody>{view.items.map((it, i) => (<tr key={it.productId + i} className="border-t border-border"><td className="p-2">{it.name}</td><td className="p-2 text-right">{it.qty} {it.unit || 'pcs'}</td><td className="p-2 text-right">{formatPKR(it.price)}</td><td className="p-2 text-right">{formatPKR(it.qty * it.price)}</td></tr>))}</tbody>
            </table>
            <div className="ml-auto w-64 space-y-1 text-sm">
              <TransactionRow label="Subtotal" value={formatPKR(view.subtotal)} />
              <TransactionRow label="Discount" value={`- ${formatPKR(view.discount)}`} />
              <TransactionRow label="Tax" value={formatPKR(view.tax)} />
              <TransactionRow label="Grand Total" value={formatPKR(view.total)} bold />
            </div>
          </div>
        )}
      </Modal>

      <ReceiveOrderModal open={!!receiveModal} purchase={receiveModal} onClose={() => setReceiveModal(null)} onReceive={handleReceive} />

      <ConfirmDialog open={confirmState.open} title="Delete Purchase Order" message={`Are you sure you want to delete ${confirmState.poNumber}? This action cannot be undone and will update supplier balances.`} confirmLabel="Delete" variant="danger" onConfirm={() => { doDelete(confirmState.id); setConfirmState({ open: false, id: "", poNumber: "" }); }} onCancel={() => setConfirmState({ open: false, id: "", poNumber: "" })} />
    </div>
  );
}
