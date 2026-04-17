import { Inbox } from "lucide-react";

export function EmptyState({ title = "No data", subtitle = "Aap ne abhi koi record add nahi kiya." }: { title?: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-brand/10 text-amber-brand">
        <Inbox className="h-8 w-8" />
      </div>
      <p className="text-base font-semibold text-walnut font-display">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
