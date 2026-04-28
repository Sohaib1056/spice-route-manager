import { Inbox } from "lucide-react";

export function EmptyState({ title = "No data", subtitle = "Aap ne abhi koi record add nahi kiya." }: { title?: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      <div className="group relative mb-6">
        <div className="absolute inset-0 scale-150 rounded-full bg-amber-brand/5 blur-3xl transition-transform duration-500 group-hover:scale-125" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-brand/20 to-amber-brand/5 text-amber-brand shadow-inner">
          <Inbox className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-walnut font-display tracking-tight">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed font-medium">{subtitle}</p>
    </div>
  );
}
