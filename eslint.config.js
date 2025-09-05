import js from "@eslint/js";
import tseslint from "typescript-eslint";
import formImplementationRule from "./.eslint-rules/require-form-implementation.js";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

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
      "scripts/**", // silence linting for scripts
      "**/*.test.{ts,tsx}",
      "**/*.stories.{ts,tsx}",
      "**/*.md",
    ],
  },

  // Base recommended rules for JS
  js.configs.recommended,

  // TypeScript support (strictness, types, unused, best practice)
  ...tseslint.config({
    files: ["src/**/*.{ts,tsx}", "*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended, ...tseslint.configs.stylistic],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json", // Enable type-aware rules
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Core TS/JS
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
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/ban-types": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
      "@typescript-eslint/prefer-for-of": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      // Enterprise hardening
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          "selector": "interface",
          "format": ["PascalCase"],
          "custom": { "regex": "^I[A-Z]", "match": false }
        },
        {
          "selector": "typeAlias",
          "format": ["PascalCase"],
        }
      ],
      "no-useless-constructor": "warn",
      "no-empty-function": "warn",
      "no-empty": ["warn", { "allowEmptyCatch": false }],
      "no-shadow": "warn",
      "@typescript-eslint/no-shadow": "warn",
      "no-warning-comments": ["warn", { "terms": ["todo", "fixme"], "location": "anywhere" }],
      // Plugin: import
      "import/order": ["warn", {
        "groups": [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
        "newlines-between": "always"
      }],
      // Plugin: React
      "react/no-direct-mutation-state": "error",
      "react/jsx-boolean-value": ["warn", "never"],
      "react/self-closing-comp": "warn",
      "react/jsx-no-useless-fragment": "warn",
      // Plugin: React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    plugins: {
      import: importPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    }
  }),

  // Custom form implementation rule for Matanuska-specific forms
  {
    files: [
      "src/components/forms/**/*.tsx",
      "src/pages/**/*.tsx",
      "src/components/wialon/**/*.tsx",
    ],
    plugins: {
      matanuska: {
        rules: {
          "require-form-implementation": formImplementationRule,
        },
      },
    },
    rules: {
      "matanuska/require-form-implementation": [
        "error",
        {
          allowedFormComponents: ["form", "Form", "Card"],
          customFormHooks: ["useFormSubmit", "useInitForm", "useFormState"],
          requiredValidation: true,
          checkManualFormState: true,
        },
      ],
    },
  },
];
