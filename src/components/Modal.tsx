import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, size = "lg", footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(26,14,7,0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "backdropFadeIn 0.18s ease-out forwards",
      }}
      onClick={onClose}
    >
      <div
        className={cn("w-full rounded-2xl bg-card overflow-hidden", sizes[size])}
        style={{
          animation: "modalIn 0.26s cubic-bezier(0.34, 1.2, 0.64, 1) forwards",
          boxShadow:
            "0 32px 80px -12px rgba(0,0,0,0.32), 0 8px 32px -4px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.06) inset",
          border: "1px solid var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b border-border px-6 py-4"
          style={{
            background: "linear-gradient(135deg, color-mix(in oklab, var(--color-cream) 80%, white), var(--color-card))",
          }}
        >
          <h3 className="text-lg font-semibold font-display text-walnut tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-cream/50 px-6 py-4 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
