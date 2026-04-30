import axios from "axios";

// Data types only
export interface Product {
  id: string;
  _id?: string;
  name: string;
  sku: string;
  category: string;
  unit: "kg" | "g" | "pack";
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  active: boolean;
  description?: string;
  image?: string;
  discountPercentage?: number;
  shelfLife?: string;
  storageInfo?: string;
}

export interface Supplier {
  id: string;
  _id?: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  ntn: string;
  openingBalance: number;
  totalPurchases: number;
  balanceDue: number;
  status: "Paid" | "Due" | "Partial";
}

export interface Sale {
  id: string;
  _id?: string;
  invoice: string;
  date: string;
  customer: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    name: string;
    qty: number;
    price: number;
    unit: string;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: "Cash" | "Credit" | "Bank Transfer";
  status: "Paid" | "Credit" | "Returned";
}

export interface Purchase {
  id: string;
  _id?: string;
  po: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: Array<{
    productId: string;
    name: string;
    qty: number;
    price: number;
    unit: string;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "Draft" | "Sent" | "Received" | "Cancelled";
  paymentStatus: "Pending" | "Partial" | "Paid";
  receivedDate?: string;
  supplierBill?: {
    name: string;
    url: string;
    size: number;
  };
}

export interface StockMovement {
  id: string;
  _id?: string;
  productId: string;
  productName: string;
  type: "In" | "Out" | "Adjustment" | "Return" | "Damaged";
  qty: number;
  prevStock: number;
  newStock: number;
  reason: string;
  doneBy: string;
  date: string;
}

export interface DashboardData {
  stats: {
    revenue: number;
    orders: number;
    lowStock: number;
    customers: number;
    totalExpenses: number;
    netProfit: number;
    cashInHand: number;
  };
  chartData: Array<{ date: string; revenue: number }>;
  recentSales: Sale[];
  todaySales: number;
  todayProfit: number;
  totalStockValuePurchase: number;
  totalStockValueSell: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Helper to normalize MongoDB _id to id
const normalize = (item: any) => {
  if (!item) return item;
  return { ...item, id: item._id || item.id };
};

class DataStore {
  private static instance: DataStore;
  private products: Product[] = [];
  private suppliers: Supplier[] = [];
  private sales: Sale[] = [];
  private purchases: Purchase[] = [];
  private movements: StockMovement[] = [];
  private dashboard: DashboardData | null = null;

  private constructor() {}

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  async init() {
    try {
      const results = await Promise.allSettled([
        api.get("/products"),
        api.get("/suppliers"),
        api.get("/sales"),
        api.get("/purchases"),
        api.get("/stock/movements"),
        api.get("/dashboard/stats"),
      ]);

      const [prod, supp, sale, pur, move, dash] = results;

      if (prod.status === "fulfilled") this.products = prod.value.data.map(normalize);
      if (supp.status === "fulfilled") this.suppliers = supp.value.data.map(normalize);
      if (sale.status === "fulfilled") this.sales = sale.value.data.map(normalize);
      if (pur.status === "fulfilled") this.purchases = pur.value.data.map(normalize);
      if (move.status === "fulfilled") this.movements = move.value.data.map(normalize);
      if (dash.status === "fulfilled") {
        this.dashboard = {
          ...dash.value.data,
          recentSales: dash.value.data.recentSales.map(normalize)
        };
      }

      const failed = results.filter(r => r.status === "rejected");
      if (failed.length > 0) {
        console.warn(`${failed.length} data sources failed to load, but the rest were initialized.`);
      }
    } catch (error) {
      console.error("Critical error during store initialization", error);
    }
  }

  getProducts() { return this.products; }
  getSuppliers() { return this.suppliers; }
  getDashboard() { return this.dashboard; }
  getSales() { return this.sales; }
  getPurchases() { return this.purchases; }
  getMovements() { return this.movements; }
  async getFinancialMetrics() {
    // Refresh stats first to get the latest from backend
    try {
      const res = await api.get("/dashboard/stats");
      this.dashboard = {
        ...res.data,
        recentSales: res.data.recentSales.map(normalize)
      };
    } catch (e) {
      console.warn("Could not refresh dashboard during metrics fetch", e);
    }

    if (this.dashboard) {
      return {
        todaySales: this.dashboard.todaySales || 0,
        todayProfit: this.dashboard.todayProfit || 0,
        totalStockValuePurchase: this.dashboard.totalStockValuePurchase || 0,
        totalStockValueSell: this.dashboard.totalStockValueSell || 0,
        totalRevenue: this.dashboard.stats?.revenue || 0,
        totalExpenses: this.dashboard.stats?.totalExpenses || 0,
        netProfit: this.dashboard.stats?.netProfit || 0,
        cashInHand: this.dashboard.stats?.cashInHand || 0
      };
    }
    // ... fallback remains same but ensuring we returned the new fields
    const today = new Date().toISOString().slice(0, 10);
    const todaySalesData = this.sales.filter(s => {
      const saleDate = typeof s.date === 'string' ? s.date.slice(0, 10) : new Date(s.date).toISOString().slice(0, 10);
      return saleDate === today;
    });
    
    const todaySales = todaySalesData.reduce((sum, s) => sum + s.total, 0);
    
    let todayProfit = 0;
    todaySalesData.forEach(sale => {
      sale.items.forEach(item => {
        const product = this.products.find(p => p.id === item.productId || p._id === item.productId);
        if (product) {
          const cost = product.buyPrice * item.qty;
          const revenue = item.price * item.qty;
          const itemDiscount = sale.subtotal > 0 ? (sale.discount / sale.subtotal) * (item.price * item.qty) : 0;
          todayProfit += (revenue - cost - itemDiscount);
        }
      });
    });

    const totalStockValuePurchase = this.products.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0);
    const totalStockValueSell = this.products.reduce((sum, p) => sum + (p.stock * p.sellPrice), 0);

    return {
      todaySales,
      todayProfit,
      totalStockValuePurchase,
      totalStockValueSell,
      totalRevenue: this.sales.reduce((sum, s) => sum + s.total, 0),
      totalExpenses: 0,
      netProfit: 0,
      cashInHand: 0
    };
  }


  async addSale(sale: Omit<Sale, "id">) {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      const payload = {
        ...sale,
        currentUserId: user?._id || user?.id || "system",
        currentUserName: user?.name || "System",
        currentUserRole: user?.role || "Staff"
      };

      const res = await api.post("/sales", payload);
      const newSale = normalize(res.data);
      this.sales = [newSale, ...this.sales];
      
      // Update local stock state
      newSale.items.forEach((item: any) => {
        const product = this.products.find(p => p.id === item.productId || p._id === item.productId);
        if (product) {
          product.stock -= item.qty;
        }
      });
      
      await this.refreshDashboard();
      return newSale;
    } catch (error) {
      console.error("[DataStore] Error adding sale:", error);
      throw error;
    }
  }

  async addPurchase(purchase: Omit<Purchase, "id">) {
    try {
      const res = await api.post("/purchases", purchase);
      const newPurchase = normalize(res.data);
      this.purchases = [newPurchase, ...this.purchases];
      
      if (newPurchase.status === "Received") {
        newPurchase.items.forEach((item: any) => {
          const product = this.products.find(p => p.id === item.productId);
          if (product) product.stock += item.qty;
        });
      }
      
      // Refresh suppliers to get updated totals and balance
      const suppRes = await api.get("/suppliers");
      this.suppliers = suppRes.data.map(normalize);
      
      await this.refreshDashboard();
      return newPurchase;
    } catch (error) {
      console.error("Error adding purchase", error);
      throw error;
    }
  }

  async receivePurchase(id: string, data: { receivedDate: string; supplierBill?: File; notes?: string }) {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      const formData = new FormData();
      // Use fallback if receivedDate is missing
      formData.append("receivedDate", data.receivedDate || new Date().toISOString().slice(0, 10));
      
      if (data.notes) {
        formData.append("notes", data.notes);
      }
      
      if (data.supplierBill instanceof File) {
        formData.append("receipt", data.supplierBill);
      }
      
      // Mandatory user info for backend validation/audit
      formData.append("currentUserId", user?._id || user?.id || "system");
      formData.append("currentUserName", user?.name || "System");
      formData.append("currentUserRole", user?.role || "Admin");

      const res = await api.put(`/purchases/${id}/receive`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const updatedPurchase = normalize(res.data);
      this.purchases = this.purchases.map(p => p.id === id ? updatedPurchase : p);
      
      // Update inventory local state for items received
      updatedPurchase.items.forEach((item: any) => {
        const product = this.products.find(p => p.id === item.productId || p._id === item.productId);
        if (product) {
          product.stock += item.qty;
        }
      });
      
      await this.refreshDashboard();
      return updatedPurchase;
    } catch (error) {
      console.error("[DataStore] Error receiving purchase:", error);
      throw error;
    }
  }

  async addProduct(product: Omit<Product, "id">, imageFile?: File) {
    try {
      let data: any = product;
      let headers = {};

      if (imageFile) {
        const formData = new FormData();
        Object.keys(product).forEach(key => {
          if (product[key as keyof typeof product] !== undefined) {
            formData.append(key, String(product[key as keyof typeof product]));
          }
        });
        formData.append("imageFile", imageFile);
        data = formData;
        headers = { "Content-Type": "multipart/form-data" };
      }

      const res = await api.post("/products", data, { headers });
      const newProd = normalize(res.data);
      this.products = [newProd, ...this.products];
      await this.refreshDashboard();
      return newProd;
    } catch (error) {
      console.error("Error adding product", error);
      throw error;
    }
  }

  async updateProduct(id: string, product: Partial<Product>, imageFile?: File) {
    try {
      let data: any = product;
      let headers = {};

      if (imageFile) {
        const formData = new FormData();
        Object.keys(product).forEach(key => {
          if (product[key as keyof typeof product] !== undefined) {
            formData.append(key, String(product[key as keyof typeof product]));
          }
        });
        formData.append("imageFile", imageFile);
        data = formData;
        headers = { "Content-Type": "multipart/form-data" };
      }

      const res = await api.put(`/products/${id}`, data, { headers });
      const updatedProd = normalize(res.data);
      this.products = this.products.map(p => p.id === id ? updatedProd : p);
      await this.refreshDashboard();
      return updatedProd;
    } catch (error) {
      console.error("Error updating product", error);
      throw error;
    }
  }

  async deleteProduct(id: string) {
    try {
      await api.delete(`/products/${id}`);
      this.products = this.products.filter(p => p.id !== id);
      await this.refreshDashboard();
    } catch (error) {
      console.error("Error deleting product", error);
      throw error;
    }
  }

  async adjustStock(productId: string, newQty: number, reason: string) {
    try {
      const res = await api.post("/stock/adjust", { productId, newQty, reason });
      const { product, movement } = res.data;
      const updatedProd = normalize(product);
      this.products = this.products.map(p => p.id === productId ? updatedProd : p);
      this.movements = [normalize(movement), ...this.movements];
      await this.refreshDashboard();
      return updatedProd;
    } catch (error) {
      console.error("Error adjusting stock", error);
      throw error;
    }
  }

  async addSupplier(supplier: Omit<Supplier, "id">) {
    try {
      const res = await api.post("/suppliers", supplier);
      const newSupp = normalize(res.data);
      this.suppliers = [newSupp, ...this.suppliers];
      return newSupp;
    } catch (error) {
      console.error("Error adding supplier", error);
      throw error;
    }
  }

  async updateSupplier(id: string, supplier: Partial<Supplier>) {
    try {
      const res = await api.put(`/suppliers/${id}`, supplier);
      const updatedSupp = normalize(res.data);
      this.suppliers = this.suppliers.map(s => s.id === id ? updatedSupp : s);
      return updatedSupp;
    } catch (error) {
      console.error("Error updating supplier", error);
      throw error;
    }
  }

  async deleteSupplier(id: string) {
    try {
      await api.delete(`/suppliers/${id}`);
      this.suppliers = this.suppliers.filter(s => s.id !== id);
    } catch (error) {
      console.error("Error deleting supplier", error);
      throw error;
    }
  }

  async updatePurchase(id: string, purchase: Partial<Purchase>) {
    try {
      const res = await api.put(`/purchases/${id}`, purchase);
      const updatedPurchase = normalize(res.data);
      this.purchases = this.purchases.map(p => p.id === id ? updatedPurchase : p);
      
      // Refresh suppliers to get updated totals
      const suppRes = await api.get("/suppliers");
      this.suppliers = suppRes.data.map(normalize);
      
      await this.refreshDashboard();
      return updatedPurchase;
    } catch (error) {
      console.error("Error updating purchase", error);
      throw error;
    }
  }

  async deletePurchase(id: string) {
    try {
      await api.delete(`/purchases/${id}`);
      this.purchases = this.purchases.filter(p => p.id !== id);
      
      // Refresh suppliers to get updated totals
      const suppRes = await api.get("/suppliers");
      this.suppliers = suppRes.data.map(normalize);
      
      await this.refreshDashboard();
    } catch (error) {
      console.error("Error deleting purchase", error);
      throw error;
    }
  }

  async init() {
    try {
      const [prodRes, suppRes, purchRes, saleRes] = await Promise.all([
        api.get("/products"),
        api.get("/suppliers"),
        api.get("/purchases"),
        api.get("/sales")
      ]);

      this.products = prodRes.data.map(normalize);
      this.suppliers = suppRes.data.map(normalize);
      this.purchases = purchRes.data.map(normalize);
      this.sales = saleRes.data.map(normalize);
      
      console.log(`[DataStore] Initialized with ${this.products.length} products and ${this.sales.length} sales`);
    } catch (error) {
      console.error("[DataStore] Initialization failed:", error);
    }
  }

  private async refreshDashboard() {
    try {
      const results = await Promise.allSettled([
        api.get("/sales"),
        api.get("/dashboard/stats"),
      ]);

      const [sale, dash] = results;

      if (sale.status === "fulfilled") this.sales = sale.value.data.map(normalize);
      if (dash.status === "fulfilled") {
        this.dashboard = {
          ...dash.value.data,
          recentSales: dash.value.data.recentSales.map(normalize)
        };
      }
    } catch (error) {
      console.error("Failed to refresh dashboard and sales", error);
    }
  }
}

export const store = DataStore.getInstance();
