import { useMemo, useState } from "react";
import { 
  Users as UsersIcon, 
  ShoppingCart, 
  TrendingUp, 
  Boxes,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { Pill } from "@/components/Pill";
import { formatPKR, formatDate } from "@/lib/format";
import { store, type Sale, type Product } from "@/lib/store";

export default function DashboardPage() {
  const [sales] = useState<Sale[]>(store.getSales());
  const [products] = useState<Product[]>(store.getProducts());

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
    const totalOrders = sales.length;
    const lowStock = products.filter(p => p.stock < p.minStock).length;
    
    return {
      revenue: totalRevenue,
      orders: totalOrders,
      lowStock: lowStock,
      customers: new Set(sales.map(s => s.customer)).size
    };
  }, [sales, products]);

  const recentSales = useMemo(() => sales.slice(0, 5), [sales]);
  
  const chartData = useMemo(() => {
    // Group sales by date for the last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    return days.map(date => ({
      date: formatDate(date),
      revenue: sales
        .filter(s => s.date.startsWith(date))
        .reduce((sum, s) => sum + s.total, 0)
    }));
  }, [sales]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Revenue" 
          value={formatPKR(stats.revenue)} 
          tone="walnut" 
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard 
          label="Total Orders" 
          value={stats.orders} 
          tone="amber" 
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard 
          label="Low Stock Items" 
          value={stats.lowStock} 
          tone="danger" 
          icon={<Boxes className="h-5 w-5" />}
        />
        <StatCard 
          label="Total Customers" 
          value={stats.customers} 
          tone="info" 
          icon={<UsersIcon className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-walnut mb-6">Revenue Overview</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-amber-brand)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-amber-brand)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  formatter={(v) => formatPKR(Number(v))}
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-amber-brand)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-walnut mb-6">Recent Sales</h3>
          <div className="space-y-4">
            {recentSales.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-walnut">{s.customer}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(s.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-walnut">{formatPKR(s.total)}</p>
                  <Pill tone={s.status === "Paid" ? "success" : "danger"}>{s.status}</Pill>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No recent sales</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
