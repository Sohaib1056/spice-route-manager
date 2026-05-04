import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, ChevronDown, LogOut, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/contexts/SettingsContext";
import { api } from "@/services/api";

export function TopHeader({ title, onMenu }: { title: string; onMenu: () => void }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [now, setNow] = useState<Date | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Initialize on client side only
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Redirect to login if no user (safety check)
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    if (!user) return;
    
    try {
      await api.logout(user.id, user.name, user.role);
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout on frontend even if API fails
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
      navigate("/login");
    }
  };

  // Don't render if no user
  if (!user) return null;

  const dateStr = now?.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) || "";
  const timeStr = now?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }) || "";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 md:px-6 backdrop-blur">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenu} className="md:hidden rounded-md p-2 text-walnut hover:bg-muted" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-transparent overflow-hidden">
            <img 
              src="/chaman_delight_no_bg.png" 
              alt={settings?.companyName || "Chaman Delight"} 
              className="h-full w-full object-contain brightness-105 contrast-110"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-display font-semibold text-walnut truncate">{title}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {settings?.companyName || "Chaman Delight Dry Fruit"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {now && (
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-walnut">{dateStr}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{timeStr}</p>
          </div>
        )}

        <button 
          onClick={() => navigate("/notifications")}
          className="relative rounded-full p-2 text-walnut hover:bg-muted" 
          aria-label="Notifications"
          title="View Audit Logs"
        >
          <Bell className="h-5 w-5" />
          <span 
            className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ 
              backgroundColor: '#ef4444', 
              color: 'white',
              border: '2px solid white'
            }}
          >
            3
          </span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-full bg-cream py-1 pr-3 pl-1 hover:bg-cream/80 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-walnut text-cream text-xs font-semibold">
              {user.initials}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-walnut">{user.name}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg z-40 overflow-hidden">
                <div className="p-3 border-b border-border bg-cream/40">
                  <p className="text-sm font-semibold text-walnut">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-amber-brand font-medium mt-1">{user.role}</p>
                </div>
                <div className="p-1">
                  {user.role === "Admin" && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/settings");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-walnut hover:bg-cream rounded-md transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile Settings
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
