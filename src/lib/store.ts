import axios from "axios";

// Data types only
export interface Product {
  id: string;
  _id?: string;
  name: string;
  urdu: string;
  sku: string;
  category: string;
  unit: "kg" | "g" | "pack";
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  active: boolean;
  description?: string;
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
  };
  chartData: Array<{ date: string; revenue: number }>;
  recentSales: Sale[];
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
      const [prodRes, suppRes, saleRes, purRes, moveRes, dashRes] = await Promise.all([
        api.get("/products"),
        api.get("/suppliers"),
        api.get("/sales"),
        api.get("/purchases"),
        api.get("/stock/movements"),
        api.get("/dashboard/stats"),
      ]);
      this.products = prodRes.data.map(normalize);
      this.suppliers = suppRes.data.map(normalize);
      this.sales = saleRes.data.map(normalize);
      this.purchases = purRes.data.map(normalize);
      this.movements = moveRes.data.map(normalize);
      this.dashboard = {
        ...dashRes.data,
        recentSales: dashRes.data.recentSales.map(normalize)
      };
    } catch (error) {
      console.error("Failed to initialize store from API", error);
    }
  }

  getProducts() { return this.products; }
  getSuppliers() { return this.suppliers; }
  getSales() { return this.sales; }
  getPurchases() { return this.purchases; }
  getMovements() { return this.movements; }
  getDashboard() { return this.dashboard; }

  async addSale(sale: Omit<Sale, "id">) {
    try {
      const res = await api.post("/sales", sale);
      const newSale = normalize(res.data);
      this.sales = [newSale, ...this.sales];
      
      newSale.items.forEach((item: any) => {
        const product = this.products.find(p => p.id === item.productId);
        if (product) product.stock -= item.qty;
      });
      await this.refreshDashboard();
      return newSale;
    } catch (error) {
      console.error("Error adding sale", error);
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
      await this.refreshDashboard();
      return newPurchase;
    } catch (error) {
      console.error("Error adding purchase", error);
      throw error;
    }
  }

  async receivePurchase(id: string) {
    try {
      const res = await api.put(`/purchases/${id}/receive`);
      const updatedPurchase = normalize(res.data);
      this.purchases = this.purchases.map(p => p.id === id ? updatedPurchase : p);
      
      updatedPurchase.items.forEach((item: any) => {
        const product = this.products.find(p => p.id === item.productId);
        if (product) product.stock += item.qty;
      });
      await this.refreshDashboard();
      return updatedPurchase;
    } catch (error) {
      console.error("Error receiving purchase", error);
      throw error;
    }
  }

  async addProduct(product: Omit<Product, "id">) {
    try {
      const res = await api.post("/products", product);
      const newProd = normalize(res.data);
      this.products = [newProd, ...this.products];
      await this.refreshDashboard();
      return newProd;
    } catch (error) {
      console.error("Error adding product", error);
      throw error;
    }
  }

  async updateProduct(id: string, product: Partial<Product>) {
    try {
      const res = await api.put(`/products/${id}`, product);
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

  private async refreshDashboard() {
    try {
      const res = await api.get("/dashboard/stats");
      this.dashboard = {
        ...res.data,
        recentSales: res.data.recentSales.map(normalize)
      };
    } catch (error) {
      console.error("Failed to refresh dashboard", error);
    }
  }
}

export const store = DataStore.getInstance();
