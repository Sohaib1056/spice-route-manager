import { useMemo, useState, useEffect } from "react";
import { ShoppingCart, Truck, Boxes, TrendingUp, Download, Printer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatPKR } from "@/lib/format";
import { api } from "@/services/api";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    const response = await api.getReportData();
    if (response.success && response.data) {
      setReportData(response.data);
    } else {
      toast.error("Failed to load report data");
    }
    setLoading(false);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch("http://localhost:5000/api/reports/export?type=combined");
      
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

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading report data...</p>
      </div>
    );
  }

  const { summary, chartData } = reportData;

  const reportCards = [
    {
      title: "Sales Revenue",
      icon: <ShoppingCart className="h-5 w-5" />,
      value: formatPKR(summary.salesRevenue),
      color: "walnut",
    },
    {
      title: "Purchase Cost",
      icon: <Truck className="h-5 w-5" />,
      value: formatPKR(summary.purchaseCost),
      color: "amber",
    },
    {
      title: "Inventory Value",
      icon: <Boxes className="h-5 w-5" />,
      value: formatPKR(summary.inventoryValue),
      color: "info",
    },
    {
      title: "Net Profit (Est.)",
      icon: <TrendingUp className="h-5 w-5" />,
      value: formatPKR(summary.netProfit),
      color: "success",
    },
  ];

  return (
    <div className="space-y-6 print-area">
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
        <div className="flex items-center justify-between mb-6 no-print">
          <h3 className="font-display text-lg font-semibold text-walnut">Sales vs Purchases (7 Days)</h3>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-cream disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> {exporting ? "Exporting..." : "CSV"}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-walnut px-3 py-1.5 text-xs font-medium text-cream hover:opacity-90"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
        </div>
        <div className="print-title hidden">
          <h3 className="font-display text-lg font-semibold text-walnut mb-4">Sales vs Purchases (7 Days)</h3>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                formatter={(v) => formatPKR(Number(v))}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="Sales" fill="var(--color-amber-brand)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Purchases" fill="var(--color-walnut)" radius={[4, 4, 0, 0]} />
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
