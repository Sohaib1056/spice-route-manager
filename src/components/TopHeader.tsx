import { useEffect, useState } from "react";
import { Bell, Menu, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function TopHeader({ title, onMenu }: { title: string; onMenu: () => void }) {
  const { user } = useAuth();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize on client side only
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now?.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) || "";
  const timeStr = now?.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) || "";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 md:px-6 backdrop-blur">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenu} className="md:hidden rounded-md p-2 text-walnut hover:bg-muted" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-display font-semibold text-walnut truncate">{title}</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">Aapka muamal, hamare haath mein</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {now && (
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-walnut">{dateStr}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{timeStr}</p>
          </div>
        )}

        <button className="relative rounded-full p-2 text-walnut hover:bg-muted" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">3</span>
        </button>

        <div className="flex items-center gap-2 rounded-full bg-cream py-1 pr-3 pl-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-walnut text-cream text-xs font-semibold">
            {user.initials}
          </div>
          <span className="hidden sm:inline text-sm font-medium text-walnut">{user.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
