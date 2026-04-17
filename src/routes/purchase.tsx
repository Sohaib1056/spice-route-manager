import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, Eye, Pencil, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { EmptyState } from "@/components/EmptyState";
import { purchases as seed, suppliers, products, type Purchase } from "@/data/mockData";
import { formatPKR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/purchase")({ component: PurchasePage });

function PurchasePage() {
  const [list, setList] = useState<Purchase[]>(seed);
  const [tab, setTab] = useState<"po" | "grn">("po");
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<Purchase | null>(null);

  const stats = useMemo(() => ({
    month: list.reduce((s, p) => s + p.total, 0),
    pending: list.filter((p) => p.status === "Sent").length,
    paid: list.filter((p) => p.paymentStatus === "Paid").reduce((s, p) => s + p.total, 0),
    duePayments: list.filter((p) => p.paymentStatus !== "Paid").reduce((s, p) => s + p.total, 0),
  }), [list]);

  const statusTone: Record<Purchase["status"], "muted" | "info" | "success" | "danger"> = {
    Draft: "muted", Sent: "info", Received: "success", Cancelled: "danger",
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
                <th className="text-right font-medium px-4 py-3">Items</th>
                <th className="text-right font-medium px-4 py-3">Total</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Payment</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(tab === "po" ? list : list.filter((p) => p.status === "Received")).map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-cream/40">
                  <td className="px-4 py-3 font-medium text-walnut">{tab === "po" ? p.po : p.po.replace("PO", "GRN")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.date)}</td>
                  <td className="px-4 py-3">{p.supplierName}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.items.length}</td>
                  <td className="px-4 py-3 text-right font-medium text-walnut">{formatPKR(p.total)}</td>
                  <td className="px-4 py-3"><Pill tone={statusTone[p.status]}>{p.status}</Pill></td>
                  <td className="px-4 py-3"><Pill tone={p.paymentStatus === "Paid" ? "success" : p.paymentStatus === "Pending" ? "danger" : "amber"}>{p.paymentStatus}</Pill></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setView(p)} className="rounded-md p-1.5 text-info hover:bg-info/10" aria-label="View"><Eye className="h-4 w-4" /></button>
                      {p.status !== "Received" && (
                        <button onClick={() => { setList((l) => l.map((x) => x.id === p.id ? { ...x, status: "Received" } : x)); toast.success("Marked as received"); }} className="rounded-md p-1.5 text-success hover:bg-success/10" aria-label="Receive"><CheckCircle2 className="h-4 w-4" /></button>
                      )}
                      <button className="rounded-md p-1.5 text-amber-brand hover:bg-amber-brand/10" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => { setList((l) => l.filter((x) => x.id !== p.id)); toast.success("Deleted"); }} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <EmptyState />}
        </div>
      </div>

      <NewPOModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={(po) => {
          setList((l) => [po, ...l]);
          setShowForm(false);
          toast.success("Purchase order created");
        }}
      />

      <Modal open={!!view} onClose={() => setView(null)} title={`Purchase Order — ${view?.po ?? ""}`} size="xl">
        {view && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium text-walnut">{view.supplierName}</p></div>
              <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium text-walnut">{formatDate(view.date)}</p></div>
            </div>
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-cream"><tr><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Price</th><th className="text-right p-2">Total</th></tr></thead>
              <tbody>{view.items.map((it, i) => (
                <tr key={i} className="border-t border-border"><td className="p-2">{it.name}</td><td className="p-2 text-right">{it.qty}</td><td className="p-2 text-right">{formatPKR(it.price)}</td><td className="p-2 text-right">{formatPKR(it.qty * it.price)}</td></tr>
              ))}</tbody>
            </table>
            <div className="ml-auto w-64 space-y-1 text-sm">
              <Row label="Subtotal" value={formatPKR(view.subtotal)} />
              <Row label="Discount" value={`- ${formatPKR(view.discount)}`} />
              <Row label="Tax" value={formatPKR(view.tax)} />
              <Row label="Grand Total" value={formatPKR(view.total)} bold />
            </div>
          </div>
        )}
      </Modal>
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

interface POForm {
  supplierId: string;
  date: string;
  expectedDelivery: string;
  paymentTerms: string;
  items: { productId: string; qty: number; price: number; discount: number }[];
  taxRate: number;
  notes: string;
}

function NewPOModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (p: Purchase) => void }) {
  const { register, control, handleSubmit, watch, reset } = useForm<POForm>({
    defaultValues: {
      supplierId: suppliers[0].id,
      date: new Date().toISOString().slice(0, 10),
      expectedDelivery: "",
      paymentTerms: "Net 30",
      items: [{ productId: products[0].id, qty: 1, price: products[0].buyPrice, discount: 0 }],
      taxRate: 5,
      notes: "",
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const taxRate = watch("taxRate");
  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const totalDiscount = items.reduce((s, it) => s + ((Number(it.qty) || 0) * (Number(it.price) || 0) * (Number(it.discount) || 0) / 100), 0);
  const tax = (subtotal - totalDiscount) * (Number(taxRate) || 0) / 100;
  const grand = subtotal - totalDiscount + tax;

  const submit = (vals: POForm, status: "Draft" | "Sent") => {
    const sup = suppliers.find((s) => s.id === vals.supplierId)!;
    const po: Purchase = {
      id: `pur-${Date.now()}`,
      po: `PO-${Math.floor(Math.random() * 9000) + 3000}`,
      date: vals.date,
      supplierId: sup.id,
      supplierName: sup.name,
      items: vals.items.map((it) => {
        const p = products.find((x) => x.id === it.productId)!;
        return { productId: p.id, name: p.name, qty: Number(it.qty), price: Number(it.price) };
      }),
      subtotal, discount: totalDiscount, tax, total: grand,
      status, paymentStatus: "Pending",
    };
    onSave(po);
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); reset(); }}
      title="New Purchase Order"
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
            <button onClick={() => append({ productId: products[0].id, qty: 1, price: products[0].buyPrice, discount: 0 })} className="inline-flex items-center gap-1 rounded-md bg-pistachio/10 px-3 py-1.5 text-xs font-medium text-pistachio hover:bg-pistachio/20"><Plus className="h-3 w-3" /> Add Item</button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-cream/60 text-xs uppercase text-muted-foreground"><tr><th className="text-left p-2">Product</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Unit Price</th><th className="text-right p-2">Disc %</th><th className="text-right p-2">Total</th><th></th></tr></thead>
              <tbody>
                {fields.map((f, idx) => {
                  const it = items[idx];
                  const total = (Number(it?.qty) || 0) * (Number(it?.price) || 0) * (1 - (Number(it?.discount) || 0) / 100);
                  return (
                    <tr key={f.id} className="border-t border-border">
                      <td className="p-2"><Controller control={control} name={`items.${idx}.productId`} render={({ field }) => (<select {...field} className="input">{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>)} /></td>
                      <td className="p-2 w-24"><input type="number" {...register(`items.${idx}.qty`, { valueAsNumber: true })} className="input text-right" /></td>
                      <td className="p-2 w-32"><input type="number" {...register(`items.${idx}.price`, { valueAsNumber: true })} className="input text-right" /></td>
                      <td className="p-2 w-20"><input type="number" {...register(`items.${idx}.discount`, { valueAsNumber: true })} className="input text-right" /></td>
                      <td className="p-2 text-right font-medium text-walnut tabular-nums w-32">{formatPKR(total)}</td>
                      <td className="p-2 w-10"><button onClick={() => remove(idx)} className="text-destructive hover:bg-destructive/10 rounded p-1"><Trash2 className="h-4 w-4" /></button></td>
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
            <Row label="Subtotal" value={formatPKR(subtotal)} />
            <Row label="Discount" value={`- ${formatPKR(totalDiscount)}`} />
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Tax (%)</span>
              <input type="number" {...register("taxRate", { valueAsNumber: true })} className="input w-20 text-right" />
            </div>
            <Row label="Tax Amount" value={formatPKR(tax)} />
            <Row label="Grand Total" value={formatPKR(grand)} bold />
          </div>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:6px 10px;font-size:14px;color:var(--color-foreground)}.input:focus{outline:none;border-color:var(--color-amber-brand);box-shadow:0 0 0 3px color-mix(in oklab, var(--color-amber-brand) 20%, transparent)}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </Modal>
  );
}
