import { useMemo } from "react";
import { 
  ShoppingCart, 
  Truck, 
  Boxes, 
  TrendingUp, 
  FileBarChart, 
  Download, 
  Printer 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { formatPKR, formatDate } from "@/lib/format";
import { store } from "@/lib/store";

export default function ReportsPage() {
  const sales = store.getSales();
  const purchases = store.getPurchases();
  const products = store.getProducts();

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    return days.map(date => ({
      name: formatDate(date),
      Sales: sales
        .filter(s => s.date.startsWith(date))
        .reduce((sum, s) => sum + s.total, 0),
      Purchases: purchases
        .filter(p => p.date.startsWith(date))
        .reduce((sum, p) => sum + p.total, 0)
    }));
  }, [sales, purchases]);

  const reportCards = [
    { title: "Sales Revenue", icon: <ShoppingCart className="h-5 w-5" />, value: formatPKR(sales.reduce((s, x) => s + x.total, 0)), color: "walnut" },
    { title: "Purchase Cost", icon: <Truck className="h-5 w-5" />, value: formatPKR(purchases.reduce((s, x) => s + x.total, 0)), color: "amber" },
    { title: "Inventory Value", icon: <Boxes className="h-5 w-5" />, value: formatPKR(products.reduce((s, x) => s + (x.stock * x.buyPrice), 0)), color: "info" },
    { title: "Net Profit (Est.)", icon: <TrendingUp className="h-5 w-5" />, value: formatPKR(sales.reduce((s, x) => s + x.total, 0) - purchases.reduce((s, x) => s + x.total, 0)), color: "success" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCards.map((c) => (
          <div key={c.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground mb-3">
              {c.icon}
              <span className="text-sm font-medium">{c.title}</span>
            </div>
            <p className="font-display text-2xl font-bold text-walnut">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-semibold text-walnut">Sales vs Purchases (7 Days)</h3>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-cream">
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-walnut px-3 py-1.5 text-xs font-medium text-cream hover:opacity-90">
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip 
                formatter={(v) => formatPKR(Number(v))}
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
              />
              <Bar dataKey="Sales" fill="var(--color-amber-brand)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Purchases" fill="var(--color-walnut)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
