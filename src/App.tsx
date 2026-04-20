import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "./components/AppLayout";
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

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/finance"
          element={
            <AppLayout>
              <FinancePage />
            </AppLayout>
          }
        />
        <Route
          path="/inventory"
          element={
            <AppLayout>
              <InventoryPage />
            </AppLayout>
          }
        />
        <Route
          path="/purchase"
          element={
            <AppLayout>
              <PurchasePage />
            </AppLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          }
        />
        <Route
          path="/sales"
          element={
            <AppLayout>
              <SalesPage />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          }
        />
        <Route
          path="/stock"
          element={
            <AppLayout>
              <StockPage />
            </AppLayout>
          }
        />
        <Route
          path="/supplier"
          element={
            <AppLayout>
              <SupplierPage />
            </AppLayout>
          }
        />
        <Route
          path="/users"
          element={
            <AppLayout>
              <UsersPage />
            </AppLayout>
          }
        />
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
          success: {
            iconTheme: {
              primary: "var(--color-success)",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--color-destructive)",
              secondary: "white",
            },
          },
        }}
      />
    </BrowserRouter>
  );
}
