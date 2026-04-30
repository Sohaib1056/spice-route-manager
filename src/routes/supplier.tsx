import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Phone, Mail, Eye, Pencil, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { formatPKR, formatDate } from "@/lib/format";
import { store, type Supplier, type Purchase } from "@/lib/store";
import { api } from "@/services/api";
import axios from "axios";

const APIU = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const norm = (item: any) => ({ ...item, id: item._id || item.id });

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

function PaymentModal({ supplier, onClose, onSave }: { supplier: Supplier | null; onClose: () => void; onSave: (amt: number, method: string, date: string, note: string) => void }) {
  const { register, handleSubmit, reset, setValue } = useForm<{ amount: number; method: string; date: string; note: string }>({
    values: { amount: 0, method: "Cash", date: new Date().toISOString().slice(0, 10), note: "" },
  });
  return (
    <Modal open={!!supplier} onClose={() => { onClose(); reset(); }} title="Record Payment" size="md"
      footer={<>
        <button onClick={onClose} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-walnut hover:bg-muted transition-colors">Cancel</button>
        <button onClick={handleSubmit((v) => onSave(Number(v.amount), v.method, v.date, v.note))} className="rounded-xl bg-amber-brand px-5 py-2.5 text-sm font-semibold text-amber-brand-foreground hover:opacity-90 transition-all">Save Payment</button>
      </>}>
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-cream/60 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Current Balance Due</p>
            <p className="font-display font-semibold text-destructive text-xl">{formatPKR(supplier?.balanceDue ?? 0)}</p>
          </div>
          <button
            type="button"
            onClick={() => setValue("amount", supplier?.balanceDue ?? 0)}
            className="text-xs font-medium text-amber-brand hover:underline border border-amber-brand/30 rounded-lg px-3 py-1.5 hover:bg-amber-brand/8 transition-colors"
          >
            Pay full amount
          </button>
        </div>
        <div><label className="lbl">Payment Amount (PKR)</label><input type="number" placeholder="Enter payment amount" {...register("amount", { valueAsNumber: true })} className="input" /></div>
        <div><label className="lbl">Payment Method</label><select {...register("method")} className="input"><option>Cash</option><option>Bank Transfer</option><option>Cheque</option></select></div>
        <div><label className="lbl">Date</label><input type="date" {...register("date")} className="input" /></div>
        <div><label className="lbl">Note</label><textarea {...register("note")} rows={2} className="input" /></div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:10px;padding:9px 13px;font-size:14px;color:var(--color-foreground)}.input:focus{outline:none;border-color:var(--color-amber-brand);box-shadow:0 0 0 3px color-mix(in oklab,var(--color-amber-brand) 18%,transparent)}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </Modal>
  );
}

// --- Main Component ---

export default function SupplierPage() {
  const [list, setList] = useState<Supplier[]>(store.getSuppliers());
  const [purchases, setPurchases] = useState<Purchase[]>(store.getPurchases());
  const [editing, setEditing] = useState<{ open: boolean; data?: Supplier }>({ open: false });
  const [ledger, setLedger] = useState<Supplier | null>(null);
  const [ledgerPayments, setLedgerPayments] = useState<any[]>([]);
  const [paying, setPaying] = useState<Supplier | null>(null);

  // Refresh data when component mounts — fetch directly from API (not store.init
  // which calls 6 endpoints in parallel and silently swallows failures)
  useEffect(() => {
    const refreshData = async () => {
      try {
        const [suppRes, purRes] = await Promise.all([
          axios.get(`${APIU}/suppliers`),
          axios.get(`${APIU}/purchases`),
        ]);
        setList(suppRes.data.map(norm));
        setPurchases(purRes.data.map(norm));
      } catch {
        // Fallback to store cache
        setList(store.getSuppliers());
        setPurchases(store.getPurchases());
      }
    };
    refreshData();
  }, []);

  const refreshAll = async () => {
    try {
      const [suppRes, purRes] = await Promise.all([
        axios.get(`${APIU}/suppliers`),
        axios.get(`${APIU}/purchases`),
      ]);
      setList(suppRes.data.map(norm));
      setPurchases(purRes.data.map(norm));
      toast.success("Data refreshed");
    } catch {
      toast.error("Failed to refresh data. Please check your connection.");
    }
  };

  const stats = {
    total: list.length,
    active: list.length,
    payable: list.reduce((s, x) => s + x.balanceDue, 0),
    monthPurchases: list.reduce((s, x) => s + x.totalPurchases, 0) / 12,
  };

  const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const handleSave = async (s: SForm) => {
    try {
      if (editing.data) {
        const updated = await store.updateSupplier(editing.data.id, s);
        setList((l) => l.map((x) => (x.id === editing.data!.id ? updated : x)));
        toast.success("Supplier updated");
      } else {
        const newSupplier = await store.addSupplier({
          ...s,
          totalPurchases: 0,
          balanceDue: s.openingBalance,
          status: s.openingBalance > 0 ? "Due" : "Paid",
        });
        setList((l) => [newSupplier, ...l]);
        toast.success("Supplier added");
      }
      setEditing({ open: false });
      // Refresh purchases to get latest data
      setPurchases(store.getPurchases());
    } catch (error) {
      toast.error("Failed to save supplier");
      console.error(error);
    }
  };

  const handlePayment = async (amt: number, method: string, date: string, note: string) => {
    if (!paying) return;
    
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      const response = await api.recordSupplierPayment(paying.id, {
        amount: amt,
        method,
        date,
        note,
        userId: user?._id || user?.id,
        userName: user?.name,
        userRole: user?.role,
      });
      
      if (response.success) {
        // Fetch fresh supplier data and purchases directly from API
        try {
          const [suppRes, purRes] = await Promise.all([
            axios.get(`${APIU}/suppliers`),
            axios.get(`${APIU}/purchases`),
          ]);
          const freshList = suppRes.data.map(norm);
          const freshPurchases = purRes.data.map(norm);
          
          setList(freshList);
          setPurchases(freshPurchases);
          
          // Also update the global store's local state if necessary
          // Note: store.getPurchases() might still return old data if not updated
          // We'll update the component state which is what the UI uses
          
          // Update ledger with fresh data
          const ledgerResponse = await api.getSupplierLedger(paying.id);
          if (ledgerResponse.success) {
            setLedgerPayments((ledgerResponse.data as any)?.payments || []);
            const updatedSupplier = freshList.find((s: Supplier) => s.id === paying.id);
            if (updatedSupplier) setLedger(updatedSupplier);
          }
        } catch (error) {
          console.error("Error refreshing data after payment:", error);
        }
        
        toast.success("Payment recorded successfully and purchase orders updated");
        setPaying(null);
      } else {
        toast.error(response.message || "Failed to record payment");
      }
    } catch (error) {
      toast.error("Failed to record payment");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Manage all your dry fruit suppliers and ledgers.</p>
        <div className="flex gap-2">
          <button onClick={refreshAll} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-walnut hover:bg-muted">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button onClick={() => setEditing({ open: true })} className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Supplier
          </button>
        </div>
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
              <button onClick={async () => {
                // Fetch fresh supplier data directly from API before opening ledger
                try {
                  const suppRes = await axios.get(`${APIU}/suppliers`);
                  const freshList = suppRes.data.map(norm);
                  setList(freshList);
                  const freshSupplier = freshList.find((x: Supplier) => x.id === s.id) || s;
                  const response = await api.getSupplierLedger(s.id);
                  if (response.success) {
                    setLedgerPayments((response.data as any)?.payments || []);
                  }
                  setLedger(freshSupplier);
                } catch {
                  const response = await api.getSupplierLedger(s.id);
                  if (response.success) setLedgerPayments((response.data as any)?.payments || []);
                  setLedger(s);
                }
              }} className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-amber-brand px-3 py-2 text-xs font-medium text-amber-brand-foreground hover:opacity-90"><Eye className="h-3.5 w-3.5" /> View Ledger</button>
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

      <Modal open={!!ledger} onClose={() => { setLedger(null); setLedgerPayments([]); }} title={`Ledger — ${ledger?.name ?? ""}`} size="xl"
        footer={<button onClick={() => { setPaying(ledger); }} className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Record Payment</button>}>
        {ledger && (() => {
          // Get fresh supplier data from list
          const freshSupplier = list.find(s => s.id === ledger.id) || ledger;
          
          // Get all purchases for this supplier
          const supplierPurchases = purchases.filter(p => p.supplierId === freshSupplier.id);
          
          // Build ledger entries with both purchases and payments
          const entries: Array<{
            date: string;
            desc: string;
            debit: number;
            credit: number;
            bal: number;
            sortDate: Date;
          }> = [];
          
          let runningBalance = freshSupplier.openingBalance;
          
          // Opening balance
          if (freshSupplier.openingBalance > 0) {
            entries.push({
              date: "Opening",
              desc: "Opening Balance",
              debit: freshSupplier.openingBalance,
              credit: 0,
              bal: runningBalance,
              sortDate: new Date(0), // Very old date for sorting
            });
          }
          
          // Add purchase orders
          supplierPurchases.forEach(purchase => {
            entries.push({
              date: formatDate(purchase.date),
              desc: `Purchase Order: ${purchase.po}`,
              debit: purchase.total,
              credit: 0,
              bal: 0, // Will calculate after sorting
              sortDate: new Date(purchase.date),
            });
          });
          
          // Add payments
          ledgerPayments.forEach(payment => {
            entries.push({
              date: formatDate(payment.date),
              desc: payment.description || "Payment",
              debit: 0,
              credit: payment.amount,
              bal: 0, // Will calculate after sorting
              sortDate: new Date(payment.date),
            });
          });
          
          // Sort by date
          entries.sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());
          
          // Calculate running balance
          entries.forEach(entry => {
            if (entry.desc !== "Opening Balance") {
              runningBalance += entry.debit - entry.credit;
              entry.bal = runningBalance;
            }
          });
          
          // Calculate total paid from payments
          const totalPaid = ledgerPayments.reduce((sum, p) => sum + p.amount, 0);
          
          // Calculate total purchases (including opening balance)
          const totalPurchasesWithOpening = freshSupplier.totalPurchases + freshSupplier.openingBalance;
          
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Stat label="Total Purchases" value={formatPKR(totalPurchasesWithOpening)} />
                <Stat label="Total Paid" value={formatPKR(totalPaid)} />
                <Stat label="Balance Due" value={formatPKR(freshSupplier.balanceDue)} danger={freshSupplier.balanceDue > 0} />
              </div>
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-cream/60 text-xs uppercase text-muted-foreground"><tr>
                  <th className="text-left p-2">Date</th><th className="text-left p-2">Description</th>
                  <th className="text-right p-2">Debit</th><th className="text-right p-2">Credit</th><th className="text-right p-2">Balance</th>
                </tr></thead>
                <tbody>
                  {entries.length > 0 ? entries.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2 text-muted-foreground">{r.date}</td>
                      <td className="p-2">{r.desc}</td>
                      <td className="p-2 text-right tabular-nums text-destructive">{r.debit ? formatPKR(r.debit) : "—"}</td>
                      <td className="p-2 text-right tabular-nums text-success">{r.credit ? formatPKR(r.credit) : "—"}</td>
                      <td className="p-2 text-right tabular-nums font-medium text-walnut">{formatPKR(r.bal)}</td>
                    </tr>
                  )) : (
                    <tr className="border-t border-border">
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">No transactions yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })()}
      </Modal>

      <PaymentModal supplier={paying} onClose={() => setPaying(null)} onSave={handlePayment} />
    </div>
  );
}
