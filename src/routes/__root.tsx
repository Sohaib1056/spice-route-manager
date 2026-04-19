import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "@/components/AppLayout";

import appCss from "../styles.css?url";

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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DryFruit Pro — Dry Fruit Management System" },
      { name: "description", content: "Premium dry fruit wholesale & retail management — inventory, sales, purchases, finance and reports." },
      { name: "author", content: "DryFruit Pro" },
      { property: "og:title", content: "DryFruit Pro — Dry Fruit Management System" },
      { property: "og:description", content: "Manage your dry fruit business end to end." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/assets/images/logo.jpg" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:image", content: "/assets/images/logo.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/jpeg", href: "/assets/images/logo.jpg" },
      { rel: "apple-touch-icon", href: "/assets/images/logo.jpg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/jpeg" sizes="32x32" href="/assets/images/logo.jpg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/logo.jpg" />
        <meta name="theme-color" content="#D4860A" />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

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
