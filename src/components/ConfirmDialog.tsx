import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  const v = {
    danger: {
      bar: "linear-gradient(90deg, #dc2626, #ef4444)",
      iconBg: "rgba(220,38,38,0.12)",
      iconClr: "#dc2626",
      btnBase: "#dc2626",
      btnHover: "#b91c1c",
      shadow: "rgba(220,38,38,0.25)",
      bg: "#fef2f2",
      border: "#fee2e2"
    },
    warning: {
      bar: "linear-gradient(90deg, #d97706, #f59e0b)",
      iconBg: "rgba(217,119,6,0.12)",
      iconClr: "#d97706",
      btnBase: "#d97706",
      btnHover: "#b45309",
      shadow: "rgba(217,119,6,0.25)",
      bg: "#fffbeb",
      border: "#fef3c7"
    },
    info: {
      bar: "linear-gradient(90deg, #2563eb, #3b82f6)",
      iconBg: "rgba(37,99,235,0.12)",
      iconClr: "#2563eb",
      btnBase: "#2563eb",
      btnHover: "#1d4ed8",
      shadow: "rgba(37,99,235,0.25)",
      bg: "#eff6ff",
      border: "#dbeafe"
    },
  }[variant];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(12, 6, 2, 0.45)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "backdropFadeIn 0.25s ease-out forwards",
      }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl"
        style={{
          animation: "confirmDialogIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          backgroundColor: "white",
          border: `1px solid ${v.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ height: "6px", background: v.bar }} />

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse"
              style={{ background: v.iconBg }}
            >
              <AlertTriangle
                className="w-10 h-10"
                style={{ color: v.iconClr }}
              />
            </div>
            <h3
              className="font-display font-black tracking-tight mb-3"
              style={{ fontSize: "24px", color: "#1a0a00" }}
            >
              {title}
            </h3>
            <p
              className="leading-relaxed font-medium px-4"
              style={{ fontSize: "15px", color: "#64748b" }}
            >
              {message}
            </p>
          </div>

          <div className="flex flex-row gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl border border-slate-200 px-6 py-4 text-sm font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all duration-200 active:scale-[0.95]"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all duration-200 active:scale-[0.95] shadow-lg"
              style={{
                background: v.btnBase,
                boxShadow: `0 10px 20px -5px ${v.shadow}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = v.btnHover;
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = v.btnBase;
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
