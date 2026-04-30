import { type ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/inventory": "Inventory Management",
  "/stock": "Stock Management",
  "/purchase": "Purchase Management",
  "/sales": "Sales / POS",
  "/supplier": "Supplier Management",
  "/finance": "Finance Management",
  "/reports": "Reports",
  "/users": "User Management",
  "/settings": "Settings",
  "/login": "Login",
  "/website-orders": "Website Orders",
};

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  const title = titles[path] ?? "DryFruit Pro";

  if (path === "/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 md:pl-60">
        <TopHeader title={title} onMenu={() => setOpen(true)} />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
