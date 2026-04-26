import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "./components/AppLayout";
import { ShopLayout } from "./components/shop/ShopLayout";
import { CartProvider } from "./context/CartContext";

// Storefront pages
import ShopHome from "./routes/shop-home";
import ShopProducts from "./routes/shop-products";
import ShopProductDetail from "./routes/shop-product-detail";
import ShopCart from "./routes/shop-cart";
import ShopAbout from "./routes/shop-about";
import ShopContact from "./routes/shop-contact";

// Admin pages
import DashboardPage from "./routes/index";
import FinancePage from "./routes/finance";
import InventoryPage from "./routes/inventory";
import LoginPage from "./routes/login";
import PurchasePage from "./routes/purchase";
import ReportsPage from "./routes/reports";
import SalesPage from "./routes/sales";
import SettingsPage from "./routes/settings";
import StockPage from "./routes/stock";
import SupplierPage from "./routes/supplier";
import UsersPage from "./routes/users";

const shop = (el: React.ReactNode) => <ShopLayout>{el}</ShopLayout>;
const admin = (el: React.ReactNode) => <AppLayout>{el}</AppLayout>;

export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Storefront */}
          <Route path="/" element={shop(<ShopHome />)} />
          <Route path="/products" element={shop(<ShopProducts />)} />
          <Route path="/products/:id" element={shop(<ShopProductDetail />)} />
          <Route path="/cart" element={shop(<ShopCart />)} />
          <Route path="/about" element={shop(<ShopAbout />)} />
          <Route path="/contact" element={shop(<ShopContact />)} />

          {/* Admin */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={admin(<DashboardPage />)} />
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/finance" element={admin(<FinancePage />)} />
          <Route path="/inventory" element={admin(<InventoryPage />)} />
          <Route path="/purchase" element={admin(<PurchasePage />)} />
          <Route path="/reports" element={admin(<ReportsPage />)} />
          <Route path="/sales" element={admin(<SalesPage />)} />
          <Route path="/settings" element={admin(<SettingsPage />)} />
          <Route path="/stock" element={admin(<StockPage />)} />
          <Route path="/supplier" element={admin(<SupplierPage />)} />
          <Route path="/users" element={admin(<UsersPage />)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--color-card)",
              color: "var(--color-walnut)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-sans)",
              borderRadius: "8px",
              padding: "12px 16px",
            },
            success: { iconTheme: { primary: "var(--color-success)", secondary: "white" } },
            error: { iconTheme: { primary: "var(--color-destructive)", secondary: "white" } },
          }}
        />
      </BrowserRouter>
    </CartProvider>
  );
}
