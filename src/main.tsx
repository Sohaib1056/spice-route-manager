import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { store } from "./lib/store";
import { App } from "./App";
import "./styles.css";

async function init() {
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
