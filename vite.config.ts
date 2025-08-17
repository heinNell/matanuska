import react from "@vitejs/plugin-react";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { defineConfig } from "vite";

// Load environment variables
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

export default defineConfig(() => {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

  return {
    plugins: [react({
      jsxImportSource: '@emotion/react', // Optional: if using emotion
      babel: {
        plugins: ['@emotion/babel-plugin'] // Optional: if using emotion
      }
    })],
    define: {
      "process.env.GOOGLE_MAPS_API_KEY": JSON.stringify(GOOGLE_MAPS_API_KEY),
      "process.env": process.env // Forward all env variables
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        "/api": {
          target: "https://us-central1-mat1-9e6b3.cloudfunctions.net",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    ssr: {
      noExternal: [],
      external: ["firebase-admin", "googleapis", "@sentry/node", "v8", "jiti"],
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "~/components/TyreManagement": resolve(__dirname, "src/components/TyreManagement"),
        "@vis.gl/react-google-maps/examples.js":
          "https://visgl.github.io/react-google-maps/scripts/examples.js",
        v8: resolve(__dirname, "src/shims/v8.js"),
        jiti: resolve(__dirname, "src/shims/jiti"),
        "jiti/*": resolve(__dirname, "src/shims/jiti/*"),
      },
    },
    optimizeDeps: {
      include: [
        "lucide-react",
        "react",
        "react-dom",
        "react-router-dom",
        "firebase/app",
        "firebase/firestore",
        "firebase/auth",
        "jspdf",
        "jspdf-autotable",
        "xlsx",
        "date-fns",
        "@capacitor-community/barcode-scanner",
      ],
      exclude: ["firebase-admin", "googleapis", "@sentry/node", "v8", "jiti"],
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      chunkSizeWarningLimit: 1800,
      emptyOutDir: true,
      assetsDir: "assets",
      rollupOptions: {
        external: [
          "/src/components/TyreManagement/TyreReports",
          "firebase-admin",
          "googleapis",
          "@sentry/node",
          "jiti",
          "v8",
          "perf_hooks",
          "node:*",
          "@babel/core",
          "babel-core",
        ],
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "firebase-core": ["firebase/app", "firebase/auth", "firebase/firestore"],
            scanner: ["@capacitor-community/barcode-scanner", "@capacitor/core"],
            "document-tools": ["jspdf", "jspdf-autotable", "xlsx"],
            "date-utils": ["date-fns"],
            "ui-components": [
              "lucide-react",
              "tailwindcss",
              "@radix-ui/react-tabs",
              "@radix-ui/react-label",
            ],
          },
        },
      },
    },
  };
});
