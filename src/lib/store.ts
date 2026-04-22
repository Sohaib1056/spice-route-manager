import axios from "axios";

// Data types only
export interface Product {
  id: string;
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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

class DataStore {
  private static instance: DataStore;
  private products: Product[] = [];
  private suppliers: Supplier[] = [];
  private sales: Sale[] = [];
  private purchases: Purchase[] = [];

  private constructor() {}

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  async init() {
    try {
      const [prodRes, suppRes, saleRes, purRes] = await Promise.all([
        api.get("/products"),
        api.get("/suppliers"),
        api.get("/sales"),
        api.get("/purchases"),
      ]);
      this.products = prodRes.data;
      this.suppliers = suppRes.data;
      this.sales = saleRes.data;
      this.purchases = purRes.data;
    } catch (error) {
      console.error("Failed to initialize store from API", error);
    }
  }

  getProducts() { return this.products; }
  getSuppliers() { return this.suppliers; }
  getSales() { return this.sales; }
  getPurchases() { return this.purchases; }

  async addSale(sale: Omit<Sale, "id">) {
    try {
      const res = await api.post("/sales", sale);
      const newSale = res.data;
      this.sales = [newSale, ...this.sales];
      
      newSale.items.forEach((item: any) => {
        const product = this.products.find(p => p.id === item.productId || (p as any)._id === item.productId);
        if (product) product.stock -= item.qty;
      });
      return newSale;
    } catch (error) {
      console.error("Error adding sale", error);
      throw error;
    }
  }

  async addPurchase(purchase: Omit<Purchase, "id">) {
    try {
      const res = await api.post("/purchases", purchase);
      const newPurchase = res.data;
      this.purchases = [newPurchase, ...this.purchases];
      
      if (newPurchase.status === "Received") {
        newPurchase.items.forEach((item: any) => {
          const product = this.products.find(p => p.id === item.productId || (p as any)._id === item.productId);
          if (product) product.stock += item.qty;
        });
      }
      return newPurchase;
    } catch (error) {
      console.error("Error adding purchase", error);
      throw error;
    }
  }

  async receivePurchase(id: string) {
    try {
      const res = await api.put(`/purchases/${id}/receive`);
      const updatedPurchase = res.data;
      this.purchases = this.purchases.map(p => 
        (p.id === id || (p as any)._id === id) ? updatedPurchase : p
      );
      
      updatedPurchase.items.forEach((item: any) => {
        const product = this.products.find(p => p.id === item.productId || (p as any)._id === item.productId);
        if (product) product.stock += item.qty;
      });
      return updatedPurchase;
    } catch (error) {
      console.error("Error receiving purchase", error);
      throw error;
    }
  }

  async addProduct(product: Omit<Product, "id">) {
    try {
      const res = await api.post("/products", product);
      this.products = [res.data, ...this.products];
      return res.data;
    } catch (error) {
      console.error("Error adding product", error);
      throw error;
    }
  }

  async updateProduct(id: string, product: Partial<Product>) {
    try {
      const res = await api.put(`/products/${id}`, product);
      this.products = this.products.map(p => 
        (p.id === id || (p as any)._id === id) ? res.data : p
      );
      return res.data;
    } catch (error) {
      console.error("Error updating product", error);
      throw error;
    }
  }

  async deleteProduct(id: string) {
    try {
      await api.delete(`/products/${id}`);
      this.products = this.products.filter(p => p.id !== id && (p as any)._id !== id);
    } catch (error) {
      console.error("Error deleting product", error);
      throw error;
    }
  }
}

export const store = DataStore.getInstance();
