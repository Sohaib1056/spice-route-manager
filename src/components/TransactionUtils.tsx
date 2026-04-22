import { Pill } from "./Pill";

export function TransactionRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t border-border pt-2 text-base font-semibold text-walnut" : "text-muted-foreground"}`}>
      <span>{label}</span><span className="tabular-nums text-walnut">{value}</span>
    </div>
  );
}

export function StatusPill({ type, status }: { type: "purchase" | "payment" | "sale"; status: string }) {
  if (type === "purchase") {
    const tones: Record<string, "muted" | "info" | "success" | "danger"> = {
      Draft: "muted", Sent: "info", Received: "success", Cancelled: "danger",
    };
    return <Pill tone={tones[status] || "muted"}>{status}</Pill>;
  }
  if (type === "payment") {
    const tones: Record<string, "success" | "danger" | "amber"> = {
      Paid: "success", Pending: "danger", Partial: "amber",
    };
    return <Pill tone={tones[status] || "muted"}>{status}</Pill>;
  }
  if (type === "sale") {
    const tones: Record<string, "success" | "danger" | "info"> = {
      Paid: "success", Credit: "danger", Returned: "info",
    };
    return <Pill tone={tones[status] || "muted"}>{status}</Pill>;
  }
  return <Pill tone="muted">{status}</Pill>;
}
