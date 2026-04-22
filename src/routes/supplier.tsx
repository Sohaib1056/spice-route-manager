import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Phone, Mail, Eye, Pencil, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { formatPKR, formatDate } from "@/lib/format";
import { store, type Supplier } from "@/lib/store";

// --- Types ---

interface SForm { 
  name: string; 
  contactPerson: string; 
  phone: string; 
  email: string; 
  city: string; 
  address: string; 
  ntn: string; 
  openingBalance: number; 
}

// --- Sub-components ---

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-lg bg-cream/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-display text-lg font-semibold ${danger ? "text-destructive" : "text-walnut"}`}>{value}</p>
    </div>
  );
}

function SupplierModal({ open, editing, onClose, onSave }: { open: boolean; editing?: Supplier; onClose: () => void; onSave: (v: SForm) => void }) {
  const { register, handleSubmit, reset } = useForm<SForm>({
    values: editing ? {
      name: editing.name, contactPerson: editing.contactPerson, phone: editing.phone, email: editing.email,
      city: editing.city, address: editing.address, ntn: editing.ntn, openingBalance: editing.openingBalance,
    } : { name: "", contactPerson: "", phone: "", email: "", city: "", address: "", ntn: "", openingBalance: 0 },
  });
  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title={editing ? "Edit Supplier" : "Add Supplier"}
      footer={<>
        <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted">Cancel</button>
        <button onClick={handleSubmit(onSave)} className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Save</button>
      </>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ["Name", "name"], ["Contact Person", "contactPerson"], ["Phone", "phone"],
          ["Email", "email"], ["City", "city"], ["NTN/CNIC", "ntn"],
        ].map(([l, n]) => (
          <div key={n}><label className="lbl">{l}</label><input {...register(n as keyof SForm)} className="input" /></div>
        ))}
        <div className="md:col-span-2"><label className="lbl">Address</label><input {...register("address")} className="input" /></div>
        <div><label className="lbl">Opening Balance (PKR)</label><input type="number" {...register("openingBalance", { valueAsNumber: true })} className="input" /></div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:8px 12px;font-size:14px}.input:focus{outline:none;border-color:var(--color-amber-brand)}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </Modal>
  );
}

function PaymentModal({ supplier, onClose, onSave }: { supplier: Supplier | null; onClose: () => void; onSave: (amt: number) => void }) {
  const { register, handleSubmit, reset } = useForm<{ amount: number; method: string; date: string; note: string }>({
    values: { amount: supplier?.balanceDue ?? 0, method: "Cash", date: new Date().toISOString().slice(0, 10), note: "" },
  });
  return (
    <Modal open={!!supplier} onClose={() => { onClose(); reset(); }} title="Record Payment" size="md"
      footer={<>
        <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted">Cancel</button>
        <button onClick={handleSubmit((v) => onSave(Number(v.amount)))} className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Save Payment</button>
      </>}>
      <div className="space-y-4">
        <div><label className="lbl">Amount (PKR)</label><input type="number" {...register("amount", { valueAsNumber: true })} className="input" /></div>
        <div><label className="lbl">Payment Method</label><select {...register("method")} className="input"><option>Cash</option><option>Bank Transfer</option><option>Cheque</option></select></div>
        <div><label className="lbl">Date</label><input type="date" {...register("date")} className="input" /></div>
        <div><label className="lbl">Note</label><textarea {...register("note")} rows={2} className="input" /></div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:8px 12px;font-size:14px}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </Modal>
  );
}

// --- Main Component ---

export default function SupplierPage() {
  const [list, setList] = useState<Supplier[]>(store.getSuppliers());
  const [editing, setEditing] = useState<{ open: boolean; data?: Supplier }>({ open: false });
  const [ledger, setLedger] = useState<Supplier | null>(null);
  const [paying, setPaying] = useState<Supplier | null>(null);

  const stats = {
    total: list.length,
    active: list.length,
    payable: list.reduce((s, x) => s + x.balanceDue, 0),
    monthPurchases: list.reduce((s, x) => s + x.totalPurchases, 0) / 12,
  };

  const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const handleSave = async (s: SForm) => {
    // In production, this would call store methods to sync with backend
    if (editing.data) {
      setList((l) => l.map((x) => (x.id === editing.data!.id ? { ...x, ...s } : x)));
      toast.success("Supplier updated");
    } else {
      setList((l) => [{ id: `s${Date.now()}`, totalPurchases: 0, balanceDue: 0, status: "Paid", ...s } as Supplier, ...l]);
      toast.success("Supplier added");
    }
    setEditing({ open: false });
  };

  const handlePayment = (amt: number) => {
    if (!paying) return;
    setList((l) => l.map((x) => x.id === paying.id ? { ...x, balanceDue: Math.max(0, x.balanceDue - amt) } : x));
    toast.success("Payment recorded");
    setPaying(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Manage all your dry fruit suppliers and ledgers.</p>
        <button onClick={() => setEditing({ open: true })} className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Suppliers" value={stats.total} icon={<Truck className="h-5 w-5" />} tone="walnut" />
        <StatCard label="Active" value={stats.active} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <StatCard label="Total Payable" value={formatPKR(stats.payable)} icon={<AlertCircle className="h-5 w-5" />} tone="danger" />
        <StatCard label="Avg Monthly Purchases" value={formatPKR(stats.monthPurchases)} icon={<Truck className="h-5 w-5" />} tone="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-walnut text-cream font-semibold">{initials(s.name)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-walnut truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.city}</p>
              </div>
              <Pill tone={s.status === "Paid" ? "success" : s.status === "Due" ? "danger" : "amber"}>{s.status}</Pill>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {s.phone}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> <span className="truncate">{s.email}</span></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-cream/60 p-3">
              <div><p className="text-xs text-muted-foreground">Total Purchases</p><p className="font-semibold text-walnut">{formatPKR(s.totalPurchases)}</p></div>
              <div><p className="text-xs text-muted-foreground">Balance Due</p><p className={`font-semibold ${s.balanceDue > 0 ? "text-destructive" : "text-success"}`}>{formatPKR(s.balanceDue)}</p></div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setLedger(s)} className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-amber-brand px-3 py-2 text-xs font-medium text-amber-brand-foreground hover:opacity-90"><Eye className="h-3.5 w-3.5" /> View Ledger</button>
              <button onClick={() => setEditing({ open: true, data: s })} className="rounded-md border border-border px-3 py-2 text-xs font-medium text-walnut hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <SupplierModal
        open={editing.open}
        editing={editing.data}
        onClose={() => setEditing({ open: false })}
        onSave={handleSave}
      />

      <Modal open={!!ledger} onClose={() => setLedger(null)} title={`Ledger — ${ledger?.name ?? ""}`} size="xl"
        footer={<button onClick={() => { setPaying(ledger); }} className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Record Payment</button>}>
        {ledger && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Total Purchases" value={formatPKR(ledger.totalPurchases)} />
              <Stat label="Total Paid" value={formatPKR(ledger.totalPurchases - ledger.balanceDue)} />
              <Stat label="Balance Due" value={formatPKR(ledger.balanceDue)} danger={ledger.balanceDue > 0} />
            </div>
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-cream/60 text-xs uppercase text-muted-foreground"><tr>
                <th className="text-left p-2">Date</th><th className="text-left p-2">Description</th>
                <th className="text-right p-2">Debit</th><th className="text-right p-2">Credit</th><th className="text-right p-2">Balance</th>
              </tr></thead>
              <tbody>
                {[
                  { date: formatDate(new Date().toISOString()), desc: "Opening Balance", debit: ledger.openingBalance, credit: 0, bal: ledger.openingBalance },
                ].map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-2 text-muted-foreground">{r.date}</td>
                    <td className="p-2">{r.desc}</td>
                    <td className="p-2 text-right tabular-nums">{r.debit ? formatPKR(r.debit) : "—"}</td>
                    <td className="p-2 text-right tabular-nums text-success">{r.credit ? formatPKR(r.credit) : "—"}</td>
                    <td className="p-2 text-right tabular-nums font-medium text-walnut">{formatPKR(r.bal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <PaymentModal supplier={paying} onClose={() => setPaying(null)} onSave={handlePayment} />
    </div>
  );
}
