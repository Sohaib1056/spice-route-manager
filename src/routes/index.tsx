import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Receipt, Package, AlertCircle, Clock, ShoppingBag,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, Legend,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { Pill } from "@/components/Pill";
import {
  dashboardStats, weeklySales, topProducts, monthlyRevExp, products, sales,
} from "@/data/mockData";
import { formatPKR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/")({ component: DashboardPage });

function DashboardPage() {
  const stats = dashboardStats();
  const recent = sales.slice(0, 6);
  const lowStock = products.filter((p) => p.stock < p.minStock).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Aaj Ki Sales" value={formatPKR(stats.todaySales)} sub="Today" tone="amber" icon={<Receipt className="h-5 w-5" />} trend={{ value: "12.4% vs yesterday", up: true }} />
        <StatCard label="Total Inventory Value" value={formatPKR(stats.inventoryValue)} sub="Across all products" tone="walnut" icon={<Package className="h-5 w-5" />} />
        <StatCard label="Low Stock Items" value={stats.lowStock} sub="Below min level" tone="danger" icon={<AlertCircle className="h-5 w-5" />} />
        <StatCard label="Pending Payments" value={formatPKR(stats.pendingPayments)} sub="To suppliers" tone="info" icon={<Clock className="h-5 w-5" />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-walnut">Sales This Week</h3>
            <Pill tone="amber">PKR</Pill>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySales} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatPKR(v)} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="sales" fill="var(--color-amber-brand)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-walnut mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {topProducts.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-walnut">{p.name}</span>
                  <span className="text-muted-foreground">{p.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-cream overflow-hidden">
                  <div className="h-full bg-amber-brand rounded-full" style={{ width: `${p.value * 3}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent + Low stock */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-display text-lg font-semibold text-walnut">Recent Transactions</h3>
            <Link to="/sales" className="text-sm text-amber-brand hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Date</th>
                  <th className="text-left font-medium px-4 py-2.5">Invoice</th>
                  <th className="text-left font-medium px-4 py-2.5">Type</th>
                  <th className="text-right font-medium px-4 py-2.5">Amount</th>
                  <th className="text-left font-medium px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(s.date)}</td>
                    <td className="px-4 py-3 font-medium text-walnut">{s.invoice}</td>
                    <td className="px-4 py-3"><Pill tone="success">Sale</Pill></td>
                    <td className="px-4 py-3 text-right font-medium text-walnut">{formatPKR(s.total)}</td>
                    <td className="px-4 py-3">
                      <Pill tone={s.status === "Paid" ? "success" : s.status === "Credit" ? "amber" : "danger"}>{s.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-display text-lg font-semibold text-walnut">Low Stock Alert</h3>
            <Pill tone="danger">{lowStock.length} items</Pill>
          </div>
          <ul className="divide-y divide-border">
            {lowStock.length === 0 && (
              <li className="px-5 py-8 text-center text-muted-foreground text-sm">All products well stocked.</li>
            )}
            {lowStock.map((p) => {
              const pct = Math.min(100, (p.stock / p.minStock) * 100);
              return (
                <li key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-brand/10 text-amber-brand">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-walnut truncate">{p.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-cream overflow-hidden">
                        <div className={`h-full rounded-full ${p.stock === 0 ? "bg-destructive" : "bg-warning"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">{p.stock}/{p.minStock} {p.unit}</span>
                    </div>
                  </div>
                  <button className="rounded-md bg-amber-brand px-3 py-1.5 text-xs font-medium text-amber-brand-foreground hover:opacity-90">
                    Order Now
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Revenue vs Expense */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-walnut mb-4">Monthly Revenue vs Expense</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevExp} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-amber-brand)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-amber-brand)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-walnut)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-walnut)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => formatPKR(v)} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-amber-brand)" fill="url(#rev)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" stroke="var(--color-walnut)" fill="url(#exp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
