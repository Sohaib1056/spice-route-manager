import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { store } from "./lib/store";
import { App } from "./App";
import "./styles.css";

async function init() {
  // Validate user session on app start
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      // Verify the stored user data is valid JSON
      JSON.parse(storedUser);
    } catch (error) {
      // If invalid, clear it
      console.error("Invalid user data in localStorage, clearing...");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
    }
  }

  // Initialize store from backend API before rendering
  await store.init();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <Suspense fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-cream">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-brand border-t-transparent"></div>
        </div>
      }>
        <App />
      </Suspense>
    </React.StrictMode>
  );
}

init();
