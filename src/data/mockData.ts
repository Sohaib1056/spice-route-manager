import { addDays, subDays, format } from "date-fns";

export type Category = "Nuts" | "Dried Fruits" | "Seeds" | "Spices";

export interface Product {
  id: string;
  name: string;
  urdu: string;
  sku: string;
  category: Category;
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
  totalPurchases: number;
  balanceDue: number;
  status: "Paid" | "Due" | "Partial";
  openingBalance: number;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Staff";
  active: boolean;
  lastLogin: string;
  created: string;
  initials: string;
}

export interface Sale {
  id: string;
  invoice: string;
  date: string;
  customer: string;
  customerPhone?: string;
  items: { productId: string; name: string; qty: number; price: number }[];
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
  items: { productId: string; name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "Draft" | "Sent" | "Received" | "Cancelled";
  paymentStatus: "Paid" | "Pending" | "Partial";
}

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: "In" | "Out" | "Adjustment" | "Return" | "Damaged";
  qty: number;
  prevStock: number;
  newStock: number;
  reason: string;
  doneBy: string;
}

export interface FinanceTxn {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "Income" | "Expense" | "Transfer";
  amount: number;
  reference: string;
  addedBy: string;
}

const today = new Date();
const d = (n: number) => format(subDays(today, n), "yyyy-MM-dd");
const dt = (n: number, h = 10) =>
  format(subDays(today, n).setHours(h, 30, 0, 0) as unknown as Date, "yyyy-MM-dd HH:mm");

export const products: Product[] = [
  { id: "p1",  name: "Badam (Almonds)",        urdu: "بادام",     sku: "DF-BAD-001", category: "Nuts",         unit: "kg", buyPrice: 2200, sellPrice: 2800, stock: 145, minStock: 30, active: true },
  { id: "p2",  name: "Kaju (Cashews)",         urdu: "کاجو",      sku: "DF-KAJ-002", category: "Nuts",         unit: "kg", buyPrice: 2800, sellPrice: 3500, stock: 78,  minStock: 25, active: true },
  { id: "p3",  name: "Pista (Pistachios)",     urdu: "پستہ",      sku: "DF-PIS-003", category: "Nuts",         unit: "kg", buyPrice: 4500, sellPrice: 5500, stock: 52,  minStock: 20, active: true },
  { id: "p4",  name: "Akhrot (Walnuts)",       urdu: "اخروٹ",     sku: "DF-AKH-004", category: "Nuts",         unit: "kg", buyPrice: 1800, sellPrice: 2400, stock: 18,  minStock: 25, active: true },
  { id: "p5",  name: "Kishmish (Raisins)",     urdu: "کشمش",      sku: "DF-KIS-005", category: "Dried Fruits", unit: "kg", buyPrice: 900,  sellPrice: 1300, stock: 210, minStock: 40, active: true },
  { id: "p6",  name: "Anjeer (Figs)",          urdu: "انجیر",     sku: "DF-ANJ-006", category: "Dried Fruits", unit: "kg", buyPrice: 2400, sellPrice: 3200, stock: 34,  minStock: 15, active: true },
  { id: "p7",  name: "Khajoor (Dates)",        urdu: "کھجور",     sku: "DF-KHA-007", category: "Dried Fruits", unit: "kg", buyPrice: 700,  sellPrice: 1100, stock: 320, minStock: 50, active: true },
  { id: "p8",  name: "Chilgoza (Pine Nuts)",   urdu: "چلغوزہ",    sku: "DF-CHL-008", category: "Nuts",         unit: "kg", buyPrice: 8500, sellPrice: 11000, stock: 12, minStock: 10, active: true },
  { id: "p9",  name: "Mungphali (Peanuts)",    urdu: "مونگ پھلی", sku: "DF-MUN-009", category: "Nuts",         unit: "kg", buyPrice: 350,  sellPrice: 550,  stock: 480, minStock: 80, active: true },
  { id: "p10", name: "Magaz (Melon Seeds)",    urdu: "مغز",       sku: "DF-MAG-010", category: "Seeds",        unit: "kg", buyPrice: 1100, sellPrice: 1600, stock: 26,  minStock: 15, active: true },
  { id: "p11", name: "Chirongi",               urdu: "چرونجی",    sku: "DF-CHI-011", category: "Nuts",         unit: "kg", buyPrice: 5200, sellPrice: 6800, stock: 8,   minStock: 10, active: true },
  { id: "p12", name: "Apricot (Khubani)",      urdu: "خوبانی",    sku: "DF-KHU-012", category: "Dried Fruits", unit: "kg", buyPrice: 1400, sellPrice: 2000, stock: 45,  minStock: 20, active: true },
  { id: "p13", name: "Black Raisins",          urdu: "کالی کشمش", sku: "DF-BLR-013", category: "Dried Fruits", unit: "kg", buyPrice: 1100, sellPrice: 1500, stock: 88,  minStock: 25, active: true },
  { id: "p14", name: "Coconut Powder",         urdu: "ناریل",     sku: "DF-COC-014", category: "Spices",       unit: "kg", buyPrice: 600,  sellPrice: 900,  stock: 0,   minStock: 20, active: true },
  { id: "p15", name: "Sesame Seeds",           urdu: "تل",        sku: "DF-SES-015", category: "Seeds",        unit: "kg", buyPrice: 480,  sellPrice: 720,  stock: 156, minStock: 30, active: true },
];

export const suppliers: Supplier[] = [
  { id: "s1", name: "Khan Dry Fruits Co.",  contactPerson: "Asif Khan",      phone: "+92 300 1234567", email: "asif@khandf.pk",  city: "Peshawar", address: "Khyber Bazaar, Peshawar",        ntn: "1234567-8", totalPurchases: 1250000, balanceDue: 185000, status: "Partial", openingBalance: 0 },
  { id: "s2", name: "Quetta Nut Traders",   contactPerson: "Bilal Achakzai", phone: "+92 321 9876543", email: "bilal@qnt.pk",    city: "Quetta",   address: "Liaqat Bazaar, Quetta",          ntn: "2345678-9", totalPurchases: 890000,  balanceDue: 0,      status: "Paid",    openingBalance: 0 },
  { id: "s3", name: "Karachi Imports Ltd.", contactPerson: "Faisal Memon",   phone: "+92 333 5556677", email: "faisal@kimp.pk",  city: "Karachi",  address: "Jodia Bazaar, Karachi",          ntn: "3456789-0", totalPurchases: 2100000, balanceDue: 420000, status: "Due",     openingBalance: 50000 },
  { id: "s4", name: "Lahore Wholesalers",   contactPerson: "Tariq Mehmood",  phone: "+92 345 7778899", email: "tariq@lhr.pk",    city: "Lahore",   address: "Akbari Mandi, Lahore",           ntn: "4567890-1", totalPurchases: 760000,  balanceDue: 35000,  status: "Partial", openingBalance: 0 },
  { id: "s5", name: "Gilgit Highland Co.",  contactPerson: "Karim Shah",     phone: "+92 312 1112223", email: "karim@gilgit.pk", city: "Gilgit",   address: "Main Bazaar, Gilgit",            ntn: "5678901-2", totalPurchases: 540000,  balanceDue: 0,      status: "Paid",    openingBalance: 0 },
];

export const users: UserRecord[] = [
  { id: "u1", name: "Imran Khan",      email: "admin@dryfruitpro.pk",   role: "Admin",   active: true,  lastLogin: dt(0, 9),  created: d(180), initials: "IK" },
  { id: "u2", name: "Fatima Sheikh",   email: "fatima@dryfruitpro.pk",  role: "Manager", active: true,  lastLogin: dt(1, 14), created: d(120), initials: "FS" },
  { id: "u3", name: "Hassan Ali",      email: "hassan@dryfruitpro.pk",  role: "Manager", active: true,  lastLogin: dt(0, 11), created: d(95),  initials: "HA" },
  { id: "u4", name: "Ayesha Malik",    email: "ayesha@dryfruitpro.pk",  role: "Staff",   active: true,  lastLogin: dt(2, 16), created: d(60),  initials: "AM" },
  { id: "u5", name: "Usman Tariq",     email: "usman@dryfruitpro.pk",   role: "Staff",   active: true,  lastLogin: dt(0, 8),  created: d(45),  initials: "UT" },
  { id: "u6", name: "Zainab Riaz",     email: "zainab@dryfruitpro.pk",  role: "Staff",   active: false, lastLogin: dt(20, 10),created: d(200), initials: "ZR" },
];

const customers = ["Walk-in Customer", "Ahmed Raza", "Saima Bano", "Hotel Pearl Continental", "Bake N Take", "Gulab Sweets", "Anwar Catering", "Madina Mart", "Walk-in Customer", "Walk-in Customer"];

function pickItems(rng: number): { productId: string; name: string; qty: number; price: number }[] {
  const n = (rng % 3) + 1;
  const items: { productId: string; name: string; qty: number; price: number }[] = [];
  for (let i = 0; i < n; i++) {
    const p = products[(rng + i * 3) % products.length];
    const qty = ((rng + i) % 5) + 1;
    items.push({ productId: p.id, name: p.name, qty, price: p.sellPrice });
  }
  return items;
}

export const sales: Sale[] = Array.from({ length: 20 }).map((_, i) => {
  const items = pickItems(i + 7);
  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const discount = i % 4 === 0 ? Math.round(subtotal * 0.05) : 0;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + tax;
  const payment = (["Cash", "Credit", "Bank Transfer"] as const)[i % 3];
  const status = payment === "Credit" ? (i % 5 === 0 ? "Returned" : "Credit") : "Paid";
  return {
    id: `sale-${i + 1}`,
    invoice: `INV-${String(1001 + i)}`,
    date: d(i % 28),
    customer: customers[i % customers.length],
    customerPhone: i % 3 === 0 ? "+92 300 1112233" : undefined,
    items, subtotal, discount, tax, total, payment, status,
  };
});

export const purchases: Purchase[] = Array.from({ length: 15 }).map((_, i) => {
  const sup = suppliers[i % suppliers.length];
  const items = pickItems(i + 2).map((it) => {
    const p = products.find((x) => x.id === it.productId)!;
    return { ...it, price: p.buyPrice };
  });
  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const discount = i % 3 === 0 ? Math.round(subtotal * 0.03) : 0;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + tax;
  const status = (["Draft", "Sent", "Received", "Received", "Received", "Cancelled"] as const)[i % 6];
  const paymentStatus = (["Paid", "Pending", "Partial"] as const)[i % 3];
  return {
    id: `pur-${i + 1}`,
    po: `PO-${String(2001 + i)}`,
    date: d((i * 2) % 28),
    supplierId: sup.id,
    supplierName: sup.name,
    items, subtotal, discount, tax, total, status, paymentStatus,
  };
});

export const stockMovements: StockMovement[] = Array.from({ length: 30 }).map((_, i) => {
  const p = products[i % products.length];
  const type = (["In", "Out", "Out", "Adjustment", "Return", "Damaged"] as const)[i % 6];
  const qty = ((i * 7) % 25) + 1;
  const prev = 50 + ((i * 11) % 100);
  const newS = type === "In" || type === "Return" ? prev + qty : prev - qty;
  return {
    id: `sm-${i + 1}`,
    date: dt(i % 28, 8 + (i % 10)),
    productId: p.id,
    productName: p.name,
    type, qty, prevStock: prev, newStock: newS,
    reason: type === "Damaged" ? "Spoiled in storage" : type === "Return" ? "Customer return" : type === "Adjustment" ? "Physical count correction" : type === "In" ? "Purchase received" : "Sale issued",
    doneBy: users[i % users.length].name,
  };
});

const finCats = {
  Income: ["Sales Revenue", "Other Income"],
  Expense: ["Purchase Cost", "Salary", "Rent", "Utilities", "Misc"],
  Transfer: ["Bank Transfer"],
};

export const financeTxns: FinanceTxn[] = Array.from({ length: 25 }).map((_, i) => {
  const type = (["Income", "Expense", "Income", "Expense", "Transfer"] as const)[i % 5];
  const cats = finCats[type];
  const category = cats[i % cats.length];
  const amount = type === "Income" ? 25000 + ((i * 3457) % 200000) : type === "Expense" ? 8000 + ((i * 2113) % 80000) : 50000;
  return {
    id: `fin-${i + 1}`,
    date: d(i % 28),
    description: `${category} entry #${i + 1}`,
    category, type, amount,
    reference: `REF-${3000 + i}`,
    addedBy: users[i % users.length].name,
  };
});

// Dashboard helpers
export const weeklySales = Array.from({ length: 7 }).map((_, i) => {
  const day = subDays(today, 6 - i);
  return {
    day: format(day, "EEE"),
    sales: 80000 + ((i * 31337) % 220000),
  };
});

export const topProducts = [
  { name: "Badam", value: 28 },
  { name: "Kaju", value: 22 },
  { name: "Khajoor", value: 18 },
  { name: "Pista", value: 16 },
  { name: "Kishmish", value: 12 },
];

export const monthlyRevExp = Array.from({ length: 12 }).map((_, i) => ({
  month: format(addDays(new Date(today.getFullYear(), 0, 1), i * 30), "MMM"),
  revenue: 800000 + ((i * 73331) % 600000),
  expense: 500000 + ((i * 51217) % 400000),
}));

export const expenseBreakdown = [
  { name: "Purchase Cost", value: 1850000 },
  { name: "Salary", value: 380000 },
  { name: "Rent", value: 220000 },
  { name: "Utilities", value: 95000 },
  { name: "Misc", value: 65000 },
];

export const dashboardStats = () => {
  const todaySales = sales.filter((s) => s.date === d(0)).reduce((sum, s) => sum + s.total, 0) || 184500;
  const inventoryValue = products.reduce((sum, p) => sum + p.stock * p.buyPrice, 0);
  const lowStock = products.filter((p) => p.stock < p.minStock).length;
  const pendingPayments = suppliers.reduce((s, x) => s + x.balanceDue, 0);
  return { todaySales, inventoryValue, lowStock, pendingPayments };
};
