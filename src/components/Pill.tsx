import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type Tone = "amber" | "walnut" | "pistachio" | "success" | "danger" | "info" | "muted" | "warning";

const map: Record<Tone, string> = {
  amber:     "bg-amber-brand/15 text-amber-brand",
  walnut:    "bg-walnut/15 text-walnut",
  pistachio: "bg-pistachio/15 text-pistachio",
  success:   "bg-success/15 text-success",
  danger:    "bg-destructive/15 text-destructive",
  info:      "bg-info/15 text-info",
  warning:   "bg-warning/30 text-warning-foreground",
  muted:     "bg-muted text-muted-foreground",
};

export function Pill({ tone = "muted", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", map[tone], className)}>
      {children}
    </span>
  );
}
