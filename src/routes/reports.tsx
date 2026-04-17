import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart, Truck, Boxes, TrendingUp, Users as UsersIcon, FileBarChart, Download, Printer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { sales, weeklySales } from "@/data/mockData";
import { formatPKR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

const reports = [
  { id: "sales",     title: "Sales Report",     desc: "Filter by date, product, or customer", icon: ShoppingCart,  tone: "amber" },
  { id: "purchase",  title: "Purchase Report",  desc: "Filter by supplier, date, or product", icon: Truck,         tone: "walnut" },
  { id: "stock",     title: "Stock Report",     desc: "Current stock levels & movement",      icon: Boxes,         tone: "pistachio" },
  { id: "pl",        title: "Profit & Loss",    desc: "Revenue vs expense, net profit",       icon: TrendingUp,    tone: "info" },
  { id: "supplier",  title: "Supplier Ledger",  desc: "Per-supplier balance report",          icon: FileBarChart,  tone: "amber" },
  { id: "customer",  title: "Customer Report",  desc: "Sales per customer",                   icon: UsersIcon,     tone: "walnut" },
] as const;

const toneMap: Record<string, string> = {
  amber: "bg-amber-brand/10 text-amber-brand",
  walnut: "bg-walnut/10 text-walnut",
  pistachio: "bg-pistachio/10 text-pistachio",
  info: "bg-info/10 text-info",
};

function ReportsPage() {
  const [active, setActive] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  if (active) {
    return <GeneratedReport id={active} onBack={() => setActive(null)} />;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Generate detailed reports for any aspect of your business.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${toneMap[r.tone]}`}><Icon className="h-6 w-6" /></div>
              <p className="font-display text-lg font-semibold text-walnut mt-3">{r.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border border-border bg-card px-2 py-1.5 text-xs" />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border border-border bg-card px-2 py-1.5 text-xs" />
              </div>
              <button onClick={() => { setActive(r.id); toast.success(`Generating ${r.title}...`); }} className="mt-3 w-full rounded-md bg-amber-brand py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Generate</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GeneratedReport({ id, onBack }: { id: string; onBack: () => void }) {
  const total = sales.reduce((s, x) => s + x.total, 0);
  const avg = total / sales.length;
  const max = Math.max(...sales.map((s) => s.total));
  const min = Math.min(...sales.map((s) => s.total));
  const title = reports.find((r) => r.id === id)?.title ?? "Report";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-walnut">← Back to Reports</button>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90"><Download className="h-4 w-4" /> Excel</button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-walnut px-4 py-2 text-sm font-medium text-cream hover:opacity-90"><Download className="h-4 w-4" /> PDF</button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted"><Printer className="h-4 w-4" /> Print</button>
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold text-walnut">{title}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: formatPKR(total) },
          { label: "Average", value: formatPKR(avg) },
          { label: "Max", value: formatPKR(max) },
          { label: "Min", value: formatPKR(min) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-display text-xl font-semibold text-walnut mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-walnut mb-4">Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklySales} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => formatPKR(Number(v))} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Bar dataKey="sales" fill="var(--color-amber-brand)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-xs uppercase text-muted-foreground"><tr>
              <th className="text-left p-3">Invoice</th><th className="text-left p-3">Date</th><th className="text-left p-3">Customer</th>
              <th className="text-right p-3">Items</th><th className="text-right p-3">Total</th><th className="text-left p-3">Payment</th>
            </tr></thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3 font-medium text-walnut">{s.invoice}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(s.date)}</td>
                  <td className="p-3">{s.customer}</td>
                  <td className="p-3 text-right">{s.items.length}</td>
                  <td className="p-3 text-right font-medium tabular-nums">{formatPKR(s.total)}</td>
                  <td className="p-3 text-muted-foreground">{s.payment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
