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
  const dotColor: Record<Tone, string> = {
    amber: "bg-amber-brand",
    walnut: "bg-walnut",
    pistachio: "bg-pistachio",
    success: "bg-success",
    danger: "bg-destructive",
    info: "bg-info",
    warning: "bg-amber-500",
    muted: "bg-muted-foreground/50",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200", 
      map[tone], 
      className
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse-glow", dotColor[tone])} />
      {children}
    </span>
  );
}
