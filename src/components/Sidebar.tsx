import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, Boxes, ShoppingCart, Receipt, Truck,
  TrendingUp, BarChart3, Users as UsersIcon, Settings as SettingsIcon, Shield, Bell, AlertTriangle, Globe,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
  permissionKey?: string; // Add permission key
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, permissionKey: "dashboard" },
      { to: "/inventory", label: "Inventory", icon: Package, permissionKey: "inventory" },
      { to: "/stock", label: "Stock", icon: Boxes, permissionKey: "stock" },
      { to: "/low-stock", label: "Low Stock Alert", icon: AlertTriangle, permissionKey: "inventory" },
    ],
  },
  {
    label: "Transactions",
    items: [
      { to: "/purchase", label: "Purchase", icon: ShoppingCart, permissionKey: "purchase" },
      { to: "/sales", label: "Sales / POS", icon: Receipt, permissionKey: "sales" },
      { to: "/returns", label: "Returns", icon: RotateCcw, permissionKey: "sales" },
      { to: "/supplier", label: "Suppliers", icon: Truck, permissionKey: "supplier" },
    ],
  },
  {
    label: "E-Commerce",
    items: [
      { to: "/website-orders", label: "Website Orders", icon: Globe, permissionKey: "sales" },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/finance", label: "Finance", icon: TrendingUp, permissionKey: "finance" },
      { to: "/reports", label: "Reports", icon: BarChart3, permissionKey: "reports" },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "/users", label: "Users", icon: UsersIcon, adminOnly: true, permissionKey: "users" },
      { to: "/permissions", label: "Permissions", icon: Shield, adminOnly: true, permissionKey: "users" },
      { to: "/notifications", label: "Audit Logs", icon: Bell, adminOnly: true, permissionKey: "users" },
      { to: "/settings", label: "Settings", icon: SettingsIcon, adminOnly: true, permissionKey: "settings" },
    ],
  },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  // Don't render if no user (safety check)
  if (!user) return null;

  // Get user permissions from localStorage
  const getUserPermissions = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.permissions || {};
      }
    } catch (error) {
      console.error("Error reading permissions:", error);
    }
    return {};
  };

  const userPermissions = getUserPermissions();

  // Check if user has permission for a specific page
  const hasPermission = (permissionKey?: string) => {
    // Admin has all permissions
    if (isAdmin) return true;
    
    // If no permission key specified, allow access
    if (!permissionKey) return true;
    
    // Check user's specific permission
    return userPermissions[permissionKey] === true;
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-walnut/40 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <Logo size="md" variant="white" showText={true} />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-hide">
          {groups.map((group) => {
            // Filter items based on admin status AND permissions
            const items = group.items.filter((i) => {
              // Check admin-only restriction
              if (i.adminOnly && !isAdmin) return false;
              
              // Check permission
              return hasPermission(i.permissionKey);
            });
            
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
      </aside>
    </>
  );
}
