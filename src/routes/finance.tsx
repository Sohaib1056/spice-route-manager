import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet, Trash2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatCard } from "@/components/StatCard";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { formatPKR, formatDate } from "@/lib/format";
import { store } from "@/lib/store";
import { api } from "@/services/api";

const COLORS = ["var(--color-amber-brand)", "var(--color-walnut)", "var(--color-pistachio)", "var(--color-info)", "var(--color-destructive)"];

interface FinanceTxn {
  _id: string;
  date: string;
  description: string;
  category: string;
  type: "Income" | "Expense" | "Transfer";
  amount: number;
  reference: string;
  method: string;
  notes?: string;
  addedBy: string;
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

function AddTxnModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (t: TxnForm) => void }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TxnForm>({
    defaultValues: {
      type: "Expense",
      category: "Salary",
      amount: 100,
      date: new Date().toISOString().slice(0, 10),
      description: "Transaction",
      reference: `TXN-${Date.now()}`,
      method: "Cash",
      notes: "",
    },
  });

  const type = watch("type");

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Add Transaction"
      size="md"
      footer={
        <>
          <button
            onClick={() => {
              onClose();
              reset();
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSave)}
            className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90"
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="lbl">Type *</label>
            <select {...register("type", { required: "Type is required" })} className="input">
              <option>Income</option>
              <option>Expense</option>
              <option>Transfer</option>
            </select>
            {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
          </div>
          <div>
            <label className="lbl">Category</label>
            <select {...register("category")} className="input">
              {type === "Income" ? (
                <>
                  <option>Sales Revenue</option>
                  <option>Other Income</option>
                </>
              ) : (
                <>
                  <option>Purchase Cost</option>
                  <option>Salary</option>
                  <option>Rent</option>
                  <option>Utilities</option>
                  <option>Misc</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="lbl">Amount *</label>
            <input 
              type="number" 
              {...register("amount", { 
                required: "Amount is required",
                valueAsNumber: true,
                min: { value: 1, message: "Amount must be greater than 0" }
              })} 
              className="input" 
              placeholder="Enter amount"
            />
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="lbl">Date *</label>
            <input 
              type="date" 
              {...register("date", { required: "Date is required" })} 
              className="input" 
            />
            {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
          </div>
        </div>
        <div>
          <label className="lbl">Description *</label>
          <input 
            {...register("description", { required: "Description is required" })} 
            className="input" 
            placeholder="Enter transaction description"
          />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="lbl">Reference#</label>
            <input 
              {...register("reference")} 
              className="input" 
              placeholder="Auto-generated if empty"
            />
          </div>
          <div>
            <label className="lbl">Payment Method</label>
            <select {...register("method")} className="input">
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
            </select>
          </div>
        </div>
        <div>
          <label className="lbl">Notes</label>
          <textarea 
            {...register("notes")} 
            rows={2} 
            className="input" 
            placeholder="Optional notes"
          />
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:8px 12px;font-size:14px}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </Modal>
  );
}

export default function FinancePage() {
  const [list, setList] = useState<FinanceTxn[]>([]);
  const [range, setRange] = useState("This Month");
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState({ type: "All", category: "All", from: "", to: "" });
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ income: 0, expense: 0, profit: 0, cash: 0 });
  const [metrics, setMetrics] = useState({ todaySales: 0, todayProfit: 0, totalStockValuePurchase: 0, totalStockValueSell: 0, totalRevenue: 0, totalExpenses: 0, netProfit: 0, cashInHand: 0 });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string }>({
    open: false,
    id: "",
  });

  useEffect(() => {
    fetchTransactions();
    fetchStats();
    fetchMonthlyData();
    fetchExpenseBreakdown();
    fetchMetrics();

    // Refresh data on window focus
    window.addEventListener('focus', () => {
      fetchTransactions();
      fetchStats();
      fetchMonthlyData();
      fetchExpenseBreakdown();
      fetchMetrics();
    });
    return () => window.removeEventListener('focus', () => {});
  }, [filter, range]);

  const fetchMetrics = async () => {
    const data = await store.getFinancialMetrics();
    setMetrics(data);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.getFinanceTransactions(filter);
      if (response.success && response.data) {
        setList(response.data as FinanceTxn[]);
      } else {
        toast.error("Failed to load finance transactions");
      }
    } catch (error) {
      console.error("Error fetching finance transactions:", error);
      toast.error("An error occurred while fetching finance transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const response = await api.getFinanceStats(range);
    if (response.success && response.data) {
      setTotals(response.data as any);
    }
  };

  const fetchMonthlyData = async () => {
    const response = await api.getMonthlyFinanceData();
    if (response.success && response.data) {
      setMonthlyData(response.data as any[]);
    }
  };

  const fetchExpenseBreakdown = async () => {
    const response = await api.getExpenseBreakdown();
    if (response.success && response.data) {
      setExpenseBreakdown(response.data as any[]);
    }
  };

  const handleSaveTxn = async (t: TxnForm) => {
    const response = await api.createFinanceTransaction({
      ...t,
      addedBy: "Current User",
      currentUserId: "admin-id",
      currentUserName: "Admin",
      currentUserRole: "Admin",
    });

    if (response.success) {
      toast.success("Transaction added successfully");
      setShowAdd(false);
      fetchTransactions();
      fetchStats();
      fetchMonthlyData();
      fetchExpenseBreakdown();
    } else {
      toast.error(response.message || "Failed to add transaction");
    }
  };

  const handleDeleteTxn = (id: string) => {
    setConfirmState({ open: true, id });
  };

  const doDeleteTxn = async (id: string) => {
    const response = await api.deleteFinanceTransaction(id, {
      currentUserId: "admin-id",
      currentUserName: "Admin",
      currentUserRole: "Admin",
    });

    if (response.success) {
      toast.success("Transaction deleted successfully");
      fetchTransactions();
      fetchStats();
      fetchMonthlyData();
      fetchExpenseBreakdown();
    } else {
      toast.error(response.message || "Failed to delete transaction");
    }
  };

  const filtered = list.filter((t) =>
    (filter.type === "All" || t.type === filter.type) &&
    (filter.category === "All" || t.category === filter.category) &&
    (!filter.from || new Date(t.date) >= new Date(filter.from)) &&
    (!filter.to || new Date(t.date) <= new Date(filter.to))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Track income, expenses, and profitability.</p>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          <option>This Week</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Sales" value={formatPKR(metrics.todaySales)} tone="amber" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Today's Profit" value={formatPKR(metrics.todayProfit)} tone="success" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Stock Value (Cost)" value={formatPKR(metrics.totalStockValuePurchase)} tone="walnut" icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Stock Value (Sell)" value={formatPKR(metrics.totalStockValueSell)} tone="info" icon={<DollarSign className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatPKR(metrics.totalRevenue)} tone="success" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Total Expenses" value={formatPKR(metrics.totalExpenses)} tone="danger" icon={<TrendingDown className="h-5 w-5" />} />
        <StatCard label="Net Profit" value={formatPKR(metrics.netProfit)} tone={metrics.netProfit >= 0 ? "success" : "danger"} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Cash in Hand" value={formatPKR(metrics.cashInHand)} tone="info" icon={<Wallet className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-walnut mb-4">Revenue vs Expense</h3>
          <div className="h-72 w-full min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(v) => formatPKR(Number(v))}
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                />
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
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatPKR(Number(v))}
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <option>All</option>
              <option>Income</option>
              <option>Expense</option>
              <option>Transfer</option>
            </select>
            <input
              type="date"
              value={filter.from}
              onChange={(e) => setFilter({ ...filter, from: e.target.value })}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
              placeholder="From"
            />
            <input
              type="date"
              value={filter.to}
              onChange={(e) => setFilter({ ...filter, to: e.target.value })}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
              placeholder="To"
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Transaction
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Description</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Type</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Reference</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    Loading transactions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id} className="border-t border-border hover:bg-cream/40">
                    <td className="p-3 text-muted-foreground">{formatDate(t.date)}</td>
                    <td className="p-3">{t.description}</td>
                    <td className="p-3 text-muted-foreground">{t.category}</td>
                    <td className="p-3">
                      <Pill tone={t.type === "Income" ? "success" : t.type === "Expense" ? "danger" : "info"}>{t.type}</Pill>
                    </td>
                    <td className="p-3 text-right font-medium text-walnut tabular-nums">{formatPKR(t.amount)}</td>
                    <td className="p-3 text-muted-foreground font-mono text-xs">{t.reference}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteTxn(t._id)}
                        className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                        title="Delete Transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddTxnModal open={showAdd} onClose={() => setShowAdd(false)} onSave={handleSaveTxn} />

      <ConfirmDialog
        open={confirmState.open}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          setConfirmState({ open: false, id: "" });
          doDeleteTxn(confirmState.id);
        }}
        onCancel={() => setConfirmState({ open: false, id: "" })}
      />
    </div>
  );
}
