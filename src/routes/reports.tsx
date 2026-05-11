import { useMemo, useState, useEffect } from "react";
import { ShoppingCart, Truck, Boxes, TrendingUp, Download, Printer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatPKR } from "@/lib/format";
import { api } from "@/services/api";
import { store } from "@/lib/store";
import toast from "react-hot-toast";
import { StatCard } from "@/components/StatCard";

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [metrics, setMetrics] = useState({ todaySales: 0, todayProfit: 0, totalStockValuePurchase: 0, totalStockValueSell: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // Only fetch if data is null or stale
    if (!reportData) {
      fetchReportData();
    }

    // Refresh data on window focus (optional: only if tab was inactive for long)
    const handleFocus = () => {
      // Avoid excessive reloading by adding a simple check if data is old
      // For now, let's keep it but ensure we handle state properly
      fetchReportData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchReportData = async () => {
    // Only show loading spinner on initial load to avoid UI flicker
    if (!reportData) setLoading(true);
    
    try {
      const [reportRes, financialMetrics] = await Promise.all([
        api.getReportData(),
        store.getFinancialMetrics()
      ]);
      
      if (reportRes.success && reportRes.data) {
        setReportData(reportRes.data);
      } else {
        toast.error("Failed to load report data");
      }
      setMetrics(financialMetrics);
    } catch (err) {
      toast.error("An error occurred while fetching report data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "https://spice-route-manager-production.up.railway.app/api";
      const response = await fetch(`${baseUrl}/reports/export?type=combined`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Report exported successfully");
      } else {
        toast.error("Failed to export report");
      }
    } catch (error) {
      toast.error("Error exporting report");
    }
    setExporting(false);
  };

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-pulse">
        <div className="h-12 w-12 rounded-full border-4 border-amber-brand/20 border-t-amber-brand animate-spin" />
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Loading Analytics...</p>
      </div>
    );
  }

  if (!reportData) return null;

  const { summary, chartData } = reportData;

  const reportCards = [
    {
      title: "Today's Sales",
      icon: <ShoppingCart className="h-5 w-5" />,
      value: formatPKR(metrics.todaySales),
      tone: "amber" as const,
    },
    {
      title: "Today's Profit",
      icon: <TrendingUp className="h-5 w-5" />,
      value: formatPKR(metrics.todayProfit),
      tone: "success" as const,
    },
    {
      title: "Total Revenue",
      icon: <TrendingUp className="h-5 w-5" />,
      value: formatPKR(metrics.totalRevenue),
      tone: "walnut" as const,
    },
    {
      title: "Purchase Cost",
      icon: <Truck className="h-5 w-5" />,
      value: formatPKR(summary.purchaseCost),
      tone: "amber" as const,
    },
    {
      title: "Stock Value (Cost)",
      icon: <Boxes className="h-5 w-5" />,
      value: formatPKR(metrics.totalStockValuePurchase),
      tone: "walnut" as const,
    },
    {
      title: "Stock Value (Sell)",
      icon: <Boxes className="h-5 w-5" />,
      value: formatPKR(metrics.totalStockValueSell),
      tone: "info" as const,
    },
  ];

  return (
    <div className="space-y-6 print-area animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCards.map((c) => (
          <StatCard key={c.title} label={c.title} value={c.value} icon={c.icon} tone={c.tone} />
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden relative">
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <h3 className="font-display text-xl font-bold text-walnut">Market Liquidity</h3>
            <p className="text-xs text-muted-foreground font-medium">Sales vs Purchases (Last 7 Days)</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-walnut hover:bg-cream transition-all disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> {exporting ? "Wait..." : "Export CSV"}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-walnut px-4 py-2 text-sm font-semibold text-cream hover:bg-walnut/90 transition-all shadow-md shadow-walnut/10"
            >
              <Printer className="h-4 w-4" /> Print Report
            </button>
          </div>
        </div>
        
        <div className="print-title hidden">
          <h3 className="font-display text-xl font-bold text-walnut mb-4 text-center">Business Analytics - Sales vs Purchases</h3>
        </div>

        <div className="h-[400px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="name" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'var(--color-muted-foreground)', fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'var(--color-muted-foreground)', fontWeight: 500 }}
                tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl glass border border-border/50 p-4 shadow-2xl animate-fade-up">
                        <p className="text-xs font-bold text-walnut mb-3 uppercase tracking-widest">{label}</p>
                        <div className="space-y-2">
                          {payload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center justify-between gap-8">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ background: entry.fill }} />
                                <span className="text-xs font-medium text-muted-foreground">{entry.name}</span>
                              </div>
                              <span className="text-xs font-bold text-walnut">{formatPKR(entry.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="Sales" 
                fill="var(--color-amber-brand)" 
                radius={[6, 6, 0, 0]} 
                barSize={32}
              />
              <Bar 
                dataKey="Purchases" 
                fill="var(--color-walnut)" 
                radius={[6, 6, 0, 0]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-title {
            display: block !important;
          }
          .print-area {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
