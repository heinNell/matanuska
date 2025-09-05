import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // Global ignore patterns
  {
    ignores: [
      // Build output and dependencies
      "node_modules/**",
      "dist/**",
      "build/**",
      "**/dist/**",
      "**/build/**",
      "coverage/**",
      "out/**",
      ".eslintcache",

      // IDE and environment
      ".vscode/**",
      ".idea/**",
      ".DS_Store",

      // Framework generated
      ".next/**",
      ".firebase/**",
      ".cache/**",
      "public/**",

      // Logs and environment
      "*.log",
      ".env*",

      // Project specific
      "scripts/**",
      "**/*.test.{ts,tsx}",
      "**/*.stories.{ts,tsx}",
      "**/*.md",
    ],
  },

  // Base recommended rules for JS
  js.configs.recommended,

  // TypeScript support
  ...tseslint.config({
    files: ["src/**/*.{ts,tsx}", "*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Core TypeScript rules
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": ["warn", { allowExpressions: false }],
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/strict-boolean-expressions": "warn",
    },
  }),
];
