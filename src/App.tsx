import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SettingsProvider } from "./contexts/SettingsContext";
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
import PermissionsPage from "./routes/permissions";
import NotificationsPage from "./routes/notifications";
import LowStockPage from "./routes/low-stock";

export function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <FinancePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <InventoryPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PurchasePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ReportsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SalesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SalesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SupplierPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <UsersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PermissionsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NotificationsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/low-stock"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LowStockPage />
                </AppLayout>
              </ProtectedRoute>
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
      </SettingsProvider>
    </BrowserRouter>
  );
}
