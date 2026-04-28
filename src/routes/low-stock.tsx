import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  AlertCircle, 
  RefreshCw,
  Filter,
  Download,
  ShoppingCart,
  XCircle
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Pill } from "@/components/Pill";
import { EmptyState } from "@/components/EmptyState";
import { formatPKR } from "@/lib/format";
import { api } from "@/services/api";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  buyPrice: number;
  sellPrice: number;
}

interface Stats {
  totalLowStock: number;
  outOfStock: number;
  criticalLowStock: number;
  totalValue: number;
}

export default function LowStockPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLowStock: 0,
    outOfStock: 0,
    criticalLowStock: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    sortBy: "stock",
    order: "asc",
  });

  const categories = ["all", "Nuts", "Dried Fruits", "Seeds", "Spices", "Other"];

  useEffect(() => {
    fetchLowStockProducts();
  }, [filters]);

  const fetchLowStockProducts = async () => {
    setLoading(true);
    try {
      const response = await api.getLowStockProducts(filters);
      if (response.success && response.data) {
        const data = response.data as { products: Product[]; stats: Stats };
        setProducts(data.products);
        setStats(data.stats);
      } else {
        toast.error("Failed to fetch low stock products");
      }
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return { label: "Out of Stock", tone: "danger" as const, icon: XCircle };
    } else if (product.stock <= product.minStock * 0.5) {
      return { label: "Critical Low", tone: "danger" as const, icon: AlertTriangle };
    } else {
      return { label: "Low Stock", tone: "amber" as const, icon: TrendingDown };
    }
  };

  const getStockPercentage = (product: Product) => {
    if (product.minStock === 0) return 0;
    return Math.min((product.stock / product.minStock) * 100, 100);
  };

  const exportToCSV = () => {
    const headers = ["SKU", "Product Name", "Category", "Current Stock", "Min Stock", "Unit", "Status"];
    const rows = products.map(p => [
      p.sku,
      p.name,
      p.category,
      p.stock,
      p.minStock,
      p.unit,
      p.stock === 0 ? "Out of Stock" : "Low Stock"
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `low-stock-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Report exported successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-amber-brand" />
          <p className="text-sm text-muted-foreground">Loading low stock items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold text-walnut">Low Stock Alert</h2>
          <p className="text-sm text-muted-foreground">Monitor and manage products that need restocking</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLowStockProducts}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-walnut hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            disabled={products.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Low Stock"
          value={stats.totalLowStock}
          icon={<Package className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Out of Stock"
          value={stats.outOfStock}
          icon={<XCircle className="h-5 w-5" />}
          tone="danger"
        />
        <StatCard
          label="Critical Low"
          value={stats.criticalLowStock}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="danger"
        />
        <StatCard
          label="Stock Value"
          value={formatPKR(stats.totalValue)}
          icon={<TrendingDown className="h-5 w-5" />}
          tone="walnut"
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-walnut">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-walnut focus:outline-none focus:ring-2 focus:ring-amber-brand"
            >
              <option value="all">All Items</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="low-stock">Low Stock Only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-walnut focus:outline-none focus:ring-2 focus:ring-amber-brand"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-walnut focus:outline-none focus:ring-2 focus:ring-amber-brand"
            >
              <option value="stock">Stock Level</option>
              <option value="name">Product Name</option>
              <option value="category">Category</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Order</label>
            <select
              value={filters.order}
              onChange={(e) => setFilters({ ...filters, order: e.target.value })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-walnut focus:outline-none focus:ring-2 focus:ring-amber-brand"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <EmptyState
          title="No Low Stock Items"
          subtitle="All products are well stocked. Great job!"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => {
            const status = getStockStatus(product);
            const percentage = getStockPercentage(product);
            const StatusIcon = status.icon;

            return (
              <div
                key={product._id}
                className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cream">
                        <Package className="h-6 w-6 text-walnut" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-walnut truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>SKU: {product.sku}</span>
                          <span>•</span>
                          <span>{product.category}</span>
                        </div>
                      </div>
                      <Pill tone={status.tone}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Pill>
                    </div>

                    {/* Stock Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Stock Level</span>
                        <span className="font-medium text-walnut">
                          {product.stock} / {product.minStock} {product.unit}
                        </span>
                      </div>
                      <div className="h-2 bg-cream rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            percentage === 0
                              ? "bg-destructive"
                              : percentage <= 50
                              ? "bg-destructive"
                              : "bg-amber-brand"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Buy Price</p>
                        <p className="font-semibold text-walnut">{formatPKR(product.buyPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sell Price</p>
                        <p className="font-semibold text-walnut">{formatPKR(product.sellPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Stock Value</p>
                        <p className="font-semibold text-walnut">
                          {formatPKR(product.stock * product.buyPrice)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        // Navigate to purchase page with this product pre-selected
                        navigate(`/purchase?product=${product._id}`);
                        toast.success(`Opening purchase order for ${product.name}`);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90 whitespace-nowrap"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
