import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet, Download, FileText } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import { StatCard } from "@/components/StatCard";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { formatPKR, formatDate } from "@/lib/format";
import { store } from "@/lib/store";

// --- Constants ---

const COLORS = ["var(--color-amber-brand)", "var(--color-walnut)", "var(--color-pistachio)", "var(--color-info)", "var(--color-destructive)"];

// --- Types ---

interface FinanceTxn {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "Income" | "Expense" | "Transfer";
  amount: number;
  reference: string;
  addedBy: string;
  method: string;
  notes?: string;
}

interface TxnForm { 
  type: "Income" | "Expense" | "Transfer"; 
  category: string; 
  amount: number; 
  date: string; 
  description: string; 
  reference: string; 
  method: string; 
  notes: string; 
}

// --- Sub-components ---

function AddTxnModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (t: Omit<FinanceTxn, "id" | "addedBy">) => void }) {
  const { register, handleSubmit, reset } = useForm<TxnForm>({
    defaultValues: { type: "Expense", category: "Salary", amount: 0, date: new Date().toISOString().slice(0, 10), description: "", reference: "", method: "Cash", notes: "" },
  });
  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title="Add Transaction" size="md"
      footer={<>
        <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted">Cancel</button>
        <button onClick={handleSubmit((v) => onSave(v))} className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Save</button>
      </>}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="lbl">Type</label><select {...register("type")} className="input"><option>Income</option><option>Expense</option><option>Transfer</option></select></div>
          <div><label className="lbl">Category</label><select {...register("category")} className="input"><option>Sales Revenue</option><option>Other Income</option><option>Purchase Cost</option><option>Salary</option><option>Rent</option><option>Utilities</option><option>Misc</option></select></div>
          <div><label className="lbl">Amount</label><input type="number" {...register("amount", { valueAsNumber: true })} className="input" /></div>
          <div><label className="lbl">Date</label><input type="date" {...register("date")} className="input" /></div>
        </div>
        <div><label className="lbl">Description</label><input {...register("description")} className="input" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="lbl">Reference#</label><input {...register("reference")} className="input" /></div>
          <div><label className="lbl">Payment Method</label><select {...register("method")} className="input"><option>Cash</option><option>Bank Transfer</option><option>Cheque</option></select></div>
        </div>
        <div><label className="lbl">Notes</label><textarea {...register("notes")} rows={2} className="input" /></div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:8px 12px;font-size:14px}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </Modal>
  );
}

// --- Main Component ---

export default function FinancePage() {
  const [list, setList] = useState<FinanceTxn[]>([]); // To be populated from store/API
  const [range, setRange] = useState("This Month");
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState({ type: "All", category: "All", from: "", to: "" });

  const totals = useMemo(() => {
    const income = list.filter((t) => t.type === "Income").reduce((s, t) => s + t.amount, 0);
    const expense = list.filter((t) => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, profit: income - expense, cash: 850000 + income - expense };
  }, [list]);

  const filtered = list.filter((t) =>
    (filter.type === "All" || t.type === filter.type) &&
    (filter.category === "All" || t.category === filter.category) &&
    (!filter.from || new Date(t.date) >= new Date(filter.from)) &&
    (!filter.to || new Date(t.date) <= new Date(filter.to))
  );

  const handleSaveTxn = async (t: Omit<FinanceTxn, "id" | "addedBy">) => {
    // In production, this would call store.addFinanceTransaction(t)
    const newTxn = { ...t, id: `fin-${Date.now()}`, addedBy: "System Admin" } as FinanceTxn;
    setList((l) => [newTxn, ...l]);
    setShowAdd(false);
    toast.success("Transaction added");
  };

  // Mock chart data structure (to be populated from real data)
  const monthlyRevExp = useMemo(() => [
    { month: "Jan", revenue: 0, expense: 0 },
    { month: "Feb", revenue: 0, expense: 0 },
    { month: "Mar", revenue: 0, expense: 0 },
  ], []);

  const expenseBreakdown = useMemo(() => [
    { name: "Rent", value: 0 },
    { name: "Salary", value: 0 },
    { name: "Misc", value: 0 },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Track income, expenses, and profitability.</p>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <option>This Week</option><option>This Month</option><option>This Year</option><option>Custom</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatPKR(totals.income)} tone="success" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Total Expenses" value={formatPKR(totals.expense)} tone="danger" icon={<TrendingDown className="h-5 w-5" />} />
        <StatCard label="Net Profit" value={formatPKR(totals.profit)} tone={totals.profit > 0 ? "amber" : "danger"} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Cash in Hand" value={formatPKR(totals.cash)} tone="info" icon={<Wallet className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-walnut mb-4">Revenue vs Expense</h3>
          <div className="h-72 w-full min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevExp} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v) => formatPKR(Number(v))} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-amber-brand)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expense" stroke="var(--color-walnut)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-walnut mb-4">Expense Breakdown</h3>
          <div className="h-72 w-full min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatPKR(Number(v))} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <option>All</option><option>Income</option><option>Expense</option><option>Transfer</option>
            </select>
            <input type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.target.value })} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            <input type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.target.value })} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
          </div>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Transaction
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-xs uppercase text-muted-foreground"><tr>
              <th className="text-left p-3">Date</th><th className="text-left p-3">Description</th><th className="text-left p-3">Category</th>
              <th className="text-left p-3">Type</th><th className="text-right p-3">Amount</th><th className="text-left p-3">Reference</th><th className="text-left p-3">Added By</th>
            </tr></thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-cream/40">
                  <td className="p-3 text-muted-foreground">{formatDate(t.date)}</td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3 text-muted-foreground">{t.category}</td>
                  <td className="p-3"><Pill tone={t.type === "Income" ? "success" : t.type === "Expense" ? "danger" : "info"}>{t.type}</Pill></td>
                  <td className="p-3 text-right font-medium text-walnut tabular-nums">{formatPKR(t.amount)}</td>
                  <td className="p-3 text-muted-foreground font-mono text-xs">{t.reference}</td>
                  <td className="p-3 text-muted-foreground">{t.addedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </div>
      </div>
      
      <AddTxnModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleSaveTxn}
      />
    </div>
  );
}
