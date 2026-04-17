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
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className={cn("absolute left-0 top-0 h-full w-1", t.bar)} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground font-display">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          {trend && (
            <p className={cn("mt-2 text-xs font-medium", trend.up ? "text-success" : "text-destructive")}>
              {trend.up ? "▲" : "▼"} {trend.value}
            </p>
          )}
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-full", t.bg, t.text)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
