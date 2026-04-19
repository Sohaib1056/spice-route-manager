import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { getRouter } from "./router";

/**
 * App Component
 * 
 * Main application component that sets up:
 * - TanStack Router
 * - Toast notifications
 * - Global providers
 */

// Create router instance
const router = getRouter();

// Declare router type for TypeScript
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <>
      {/* Router Provider - Handles all routing */}
      <RouterProvider router={router} />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--color-card)",
            color: "var(--color-walnut)",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-sans)",
            borderRadius: "8px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "var(--color-success)",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--color-destructive)",
              secondary: "white",
            },
          },
        }}
      />
    </>
  );
}
