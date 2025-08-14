export default {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    // Use our eslint-specific tsconfig
    tsconfigRootDir: process.cwd(),
    project: './tsconfig.eslint.json',
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "unused-imports",
  ],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier" // 👉 Skakel enige konflikte met Prettier af
  ],
  rules: {
    // 🔍 Unused imports en variables
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],

    // 🧼 Algemene fixes (maar hou styl uit)
    "react/prop-types": "off", // jy gebruik waarskynlik TypeScript
    "@typescript-eslint/no-empty-function": "on",
    "@typescript-eslint/no-explicit-any": "off"
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
