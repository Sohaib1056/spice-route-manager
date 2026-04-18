import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, Boxes, ShoppingCart, Receipt, Truck,
  TrendingUp, BarChart3, Users as UsersIcon, Settings as SettingsIcon, LogOut, Nut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/inventory", label: "Inventory", icon: Package },
      { to: "/stock", label: "Stock", icon: Boxes },
    ],
  },
  {
    label: "Transactions",
    items: [
      { to: "/purchase", label: "Purchase", icon: ShoppingCart },
      { to: "/sales", label: "Sales / POS", icon: Receipt },
      { to: "/supplier", label: "Suppliers", icon: Truck },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/finance", label: "Finance", icon: TrendingUp },
      { to: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "/users", label: "Users", icon: UsersIcon, adminOnly: true },
      { to: "/settings", label: "Settings", icon: SettingsIcon, adminOnly: true },
    ],
  },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth data if needed
    // localStorage.removeItem('authToken');
    navigate({ to: "/login" });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-walnut/40 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-brand">
            <Nut className="h-5 w-5 text-amber-brand-foreground" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-amber-brand leading-none">DryFruit Pro</p>
            <p className="text-[10px] text-cream/70 mt-1 tracking-wide">WHOLESALE & RETAIL</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {groups.map((group) => {
            const items = group.items.filter((i) => !i.adminOnly || isAdmin);
            if (!items.length) return null;
            return (
              <div key={group.label}>
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-cream/50">{group.label}</p>
                <ul className="space-y-1">
                  {items.map((item) => {
                    const active = pathname === item.to;
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={onClose}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-sidebar-accent text-amber-brand"
                              : "text-cream/80 hover:bg-sidebar-accent/60 hover:text-cream"
                          )}
                        >
                          {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-amber-brand" />}
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-brand text-amber-brand-foreground font-semibold text-sm">
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-cream">{user.name}</p>
              <p className="text-[10px] uppercase tracking-wide text-amber-brand">{user.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="rounded-md p-2 text-cream/70 hover:bg-sidebar-accent hover:text-cream transition-colors" 
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
