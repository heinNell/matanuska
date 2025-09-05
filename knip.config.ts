import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // Top-level entry files (root SPA/server scripts)
  entry: [
    "src/main.tsx", // Vite SPA
    "src/App.tsx",
    "vite.config.ts",
    "server.js",
    "src/pages/**/*.{ts,tsx,js,jsx}", // All "pages" for Next.js/Vite-SSR style
  ],

  // Include all code except tests/specs
  project: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.test.{js,jsx,ts,tsx}",
    "!src/**/*.spec.{js,jsx,ts,tsx}",
  ],

  // Ignore patterns
  ignore: [
    "**/dist/**",
    "**/.next/**",
    "**/build/**",
    "**/node_modules/**",
    "**/public/**",
    "**/*.d.ts",
    "**/*.test.{js,jsx,ts,tsx}",
    "**/*.spec.{js,jsx,ts,tsx}",
    "capacitor.config.ts",
    "jest.config.js",
    "jest.setup.ts",
    "vitest.config.ts", // <--- ADD THIS LINE
    "src/utils/envChecker.ts",
    "src/components/ui/index.ts", // Barrel
    "src/components/layout/index.ts", // Barrel
    "src/types/index.ts", // Barrel
  ],

  // Optionally ignore binaries/cli tools
  ignoreBinaries: ["vitest"],

  // Ignore dev dependencies you don't want to report as unused
  ignoreDependencies: [
    "@types/*",
    "eslint-*",
    "@eslint/*",
    "vite",
    "typescript",
    "@vitejs/*",
    "vitest",
    "@vitest/*",
    "jest",
    "@jest/*",
  ],
};

export default config;
