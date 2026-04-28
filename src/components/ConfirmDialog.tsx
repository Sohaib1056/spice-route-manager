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
    },
    warning: {
      bar: "linear-gradient(90deg, #d97706, #f59e0b)",
      iconBg: "rgba(217,119,6,0.12)",
      iconClr: "#d97706",
      btnBase: "#d97706",
      btnHover: "#b45309",
      shadow: "rgba(217,119,6,0.25)",
    },
    info: {
      bar: "linear-gradient(90deg, #2563eb, #3b82f6)",
      iconBg: "rgba(37,99,235,0.12)",
      iconClr: "#2563eb",
      btnBase: "#2563eb",
      btnHover: "#1d4ed8",
      shadow: "rgba(37,99,235,0.25)",
    },
  }[variant];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(12, 6, 2, 0.62)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        animation: "backdropFadeIn 0.18s ease-out forwards",
      }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card overflow-hidden"
        style={{
          animation: "confirmDialogIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          boxShadow:
            "0 32px 80px -10px rgba(0,0,0,0.45), 0 8px 32px -4px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.07) inset",
          border: "1px solid var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored accent bar */}
        <div style={{ height: "3px", background: v.bar }} />

        <div className="p-6">
          {/* Icon + Content */}
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: v.iconBg }}
            >
              <AlertTriangle
                className="w-5 h-5"
                style={{ color: v.iconClr }}
              />
            </div>
            <div className="flex-1 pt-0.5">
              <h3
                className="font-display font-semibold leading-snug"
                style={{ fontSize: "15px", color: "var(--color-walnut)" }}
              >
                {title}
              </h3>
              <p
                className="mt-1.5 leading-relaxed"
                style={{ fontSize: "13.5px", color: "var(--color-muted-foreground)" }}
              >
                {message}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-4" />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-walnut hover:bg-muted transition-all duration-150 active:scale-[0.97]"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 active:scale-[0.97]"
              style={{
                background: v.btnBase,
                boxShadow: `0 4px 16px -2px ${v.shadow}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = v.btnHover;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = v.btnBase;
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
