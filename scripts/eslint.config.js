import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
  // Global ignores
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // TypeScript rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json", // Use our special tsconfig
        projectService: true, // Better support for project references
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // JavaScript rules
  {
    files: ["**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      globals: {
        require: "readonly",
        module: "readonly",
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
      },
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "warn",
      // Disable TypeScript-specific rules for JavaScript files
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "on",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  prettier,
];
