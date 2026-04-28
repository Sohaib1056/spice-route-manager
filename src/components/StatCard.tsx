import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon: ReactNode;
  tone?: "amber" | "walnut" | "danger" | "success" | "info";
  trend?: { value: string; up?: boolean };
}

const toneMap = {
  amber:   { bg: "bg-amber-brand/10",  text: "text-amber-brand",  bar: "bg-amber-brand" },
  walnut:  { bg: "bg-walnut/10",       text: "text-walnut",       bar: "bg-walnut" },
  danger:  { bg: "bg-destructive/10",  text: "text-destructive",  bar: "bg-destructive" },
  success: { bg: "bg-success/10",      text: "text-success",      bar: "bg-success" },
  info:    { bg: "bg-info/10",         text: "text-info",         bar: "bg-info" },
};

export function StatCard({ label, value, sub, icon, tone = "amber", trend }: StatCardProps) {
  const t = toneMap[tone];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-walnut/5">
      <div className={cn("absolute left-0 top-0 h-full w-1 transition-all duration-300 group-hover:w-1.5", t.bar)} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-2xl font-bold text-walnut font-display tracking-tight">{value}</p>
          </div>
          {sub && <p className="mt-1 text-xs text-muted-foreground font-medium">{sub}</p>}
          {trend && (
            <div className={cn("mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", 
              trend.up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
              {trend.up ? "▲" : "▼"} {trend.value}
            </div>
          )}
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:rotate-3", t.bg, t.text)}>
          {icon}
        </div>
      </div>
      
      {/* Background Glow */}
      <div className={cn("absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20", t.bar)} />
    </div>
  );
}
