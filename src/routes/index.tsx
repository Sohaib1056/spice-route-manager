import { useMemo, useState, useEffect } from "react";
import { 
  Users as UsersIcon, 
  ShoppingCart, 
  TrendingUp, 
  Boxes,
  Package,
  DollarSign,
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
  Bar,
  Legend,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { Pill } from "@/components/Pill";
import { formatPKR, formatDate } from "@/lib/format";
import { store, type DashboardData } from "@/lib/store";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(store.getDashboard());

  useEffect(() => {
    setData(store.getDashboard());
  }, []);

  // Calculate Purchase vs Sales data
  const purchaseVsSalesData = useMemo(() => {
    const purchases = store.getPurchases();
    const sales = store.getSales();
    
    // Group by last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    return last7Days.map(date => {
      const dayPurchases = purchases.filter(p => p.date.startsWith(date));
      const daySales = sales.filter(s => s.date.startsWith(date));
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        purchases: dayPurchases.reduce((sum, p) => sum + p.total, 0),
        sales: daySales.reduce((sum, s) => sum + s.total, 0),
      };
    });
  }, []);

  // Calculate Top Products data
  const topProductsData = useMemo(() => {
    const sales = store.getSales();
    const productSales: Record<string, number> = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (productSales[item.name]) {
          productSales[item.name] += item.qty;
        } else {
          productSales[item.name] = item.qty;
        }
      });
    });
    
    // Sort and get top 5
    return Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));
  }, []);

  if (!data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-brand border-t-transparent"></div>
      </div>
    );
  }

  const { stats, chartData, recentSales } = data;

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
                  labelFormatter={(label) => formatDate(label)}
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

      {/* New Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Purchase vs Sales Comparison Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-lg font-semibold text-walnut">Purchase vs Sales</h3>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days comparison</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-pistachio"></div>
                <span className="text-xs text-muted-foreground">Sales</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-brand"></div>
                <span className="text-xs text-muted-foreground">Purchases</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseVsSalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--color-muted-foreground)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `${v/1000}k`}
                />
                <Tooltip 
                  formatter={(v) => formatPKR(Number(v))}
                  contentStyle={{ 
                    background: "var(--color-card)", 
                    border: "1px solid var(--color-border)", 
                    borderRadius: 8 
                  }}
                />
                <Bar dataKey="sales" fill="var(--color-pistachio)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="purchases" fill="var(--color-amber-brand)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-lg font-semibold text-walnut">Top Selling Products</h3>
              <p className="text-xs text-muted-foreground mt-1">By quantity sold</p>
            </div>
            <Package className="h-5 w-5 text-amber-brand" />
          </div>
          <div className="h-80 w-full">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                  <XAxis 
                    type="number" 
                    stroke="var(--color-muted-foreground)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="var(--color-muted-foreground)" 
                    fontSize={11} 
                    width={120}
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(v) => [`${v} units`, 'Sold']}
                    contentStyle={{ 
                      background: "var(--color-card)", 
                      border: "1px solid var(--color-border)", 
                      borderRadius: 8 
                    }}
                  />
                  <Bar dataKey="qty" fill="var(--color-pistachio)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No sales data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
