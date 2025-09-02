// src/main.tsx
import { SnackbarProvider } from "notistack";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Add proper typing for Vite environment variables
interface ImportMetaEnv {
  // Firebase configuration
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;

  // Wialon integration
  readonly VITE_WIALON_SESSION_TOKEN?: string;
  readonly VITE_WIALON_LOGIN_URL?: string;
  readonly VITE_WIALON_TOKEN?: string;
  readonly VITE_WIALON_API_URL?: string;

  // Google Maps
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_GOOGLE_MAP_ID?: string;

  // Application settings
  readonly VITE_ENV_MODE?: string;

  // Allow for other environment variables
  [key: string]: string | undefined;
}

declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

// Minimal, safe env bootstrap
(() => {
  try {
    const KEYS = [
      // Firebase configuration
      "VITE_FIREBASE_API_KEY",
      "VITE_FIREBASE_AUTH_DOMAIN",
      "VITE_FIREBASE_PROJECT_ID",
      "VITE_FIREBASE_STORAGE_BUCKET",
      "VITE_FIREBASE_MESSAGING_SENDER_ID",
      "VITE_FIREBASE_APP_ID",

      // Wialon integration
      "VITE_WIALON_SESSION_TOKEN",
      "VITE_WIALON_LOGIN_URL",
      "VITE_WIALON_TOKEN",
      "VITE_WIALON_API_URL",

      // Google Maps
      "VITE_GOOGLE_MAPS_API_KEY",
      "VITE_GOOGLE_MAP_ID",

      // Application settings
      "VITE_ENV_MODE",
    ] as const;

    const read = (k: string): string => {
      // Prefer Vite env; fall back to process.env if present
      try {
        const v = import.meta.env?.[k];
        if (typeof v !== "undefined") return String(v);
      } catch {
        /* ignore */
      }
      try {
        const v = (process as NodeJS.Process)?.env?.[k];
        if (typeof v !== "undefined") return String(v);
      } catch {
        /* ignore */
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

// Render app
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
