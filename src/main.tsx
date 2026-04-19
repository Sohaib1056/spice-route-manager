import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

/**
 * Main Entry Point
 * 
 * This is the entry point of the application.
 * It renders the App component into the DOM.
 */

// Get root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure there is a div with id='root' in your HTML.");
}

// Create React root and render App
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
