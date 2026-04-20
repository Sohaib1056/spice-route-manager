import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "@/components/AppLayout";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-bold text-walnut">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-walnut">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Yeh page maujood nahi hai ya hata diya gaya hai.
        </p>
        <div className="mt-6">
          <a href="/" className="inline-flex items-center justify-center rounded-md bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-card)",
            color: "var(--color-walnut)",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-sans)",
          },
        }}
      />
    </>
  );
}
