import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

/**
 * Main Entry Point
 * 
 * This is the entry point of the application.
 * It renders the App component into the DOM.
 * 
 * Fixed for static deployment (Vercel/Cloudflare)
 */

// Get root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure there is a div with id='root' in your HTML.");
}

// Ensure DOM is ready before rendering
const renderApp = () => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
