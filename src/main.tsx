// src/main.tsx
import { SnackbarProvider } from "notistack";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

/* ----------------- Minimal, safe env bootstrap ----------------- */
(() => {
  try {
    const KEYS = [
      "VITE_WIALON_SESSION_TOKEN",
      "VITE_WIALON_LOGIN_URL",
      "VITE_GOOGLE_MAPS_API_KEY",
      "VITE_ENV_MODE",
      "VITE_FIREBASE_API_KEY",
      "VITE_FIREBASE_AUTH_DOMAIN",
      "VITE_FIREBASE_PROJECT_ID",
    ] as const;

    const read = (k: string): string => {
      // Prefer Vite env; fall back to process.env if present
      try {
        const v = (import.meta as any)?.env?.[k];
        if (typeof v !== "undefined") return String(v);
      } catch {
        // import.meta.env may be unavailable in some bundles
        void 0;
      }
      try {
        const v = (process as any)?.env?.[k];
        if (typeof v !== "undefined") return String(v);
      } catch {
        // process.env is undefined in the browser
        void 0;
      }
      return "";
    };

    window.__ENV__ = KEYS.reduce<Record<string, string>>((acc, k) => {
      acc[k] = read(k);
      return acc;
    }, {});
  } catch (e) {
    console.warn("Env bootstrap failed:", e);
  }
})();

/* --------------------------- Render app --------------------------- */
const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <App />
      </SnackbarProvider>
    </BrowserRouter>
  </React.StrictMode>
);
