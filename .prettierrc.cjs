/* .eslintrc.cjs */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // Disables ESLint rules that would conflict with Prettier
    "eslint-config-prettier"
  ],
  rules: {
    // Unused imports/vars
    "no-unused-vars": "error", // use TS-aware rule instead
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }
    ],

    // Ensure imports resolve and are used properly
    "import/no-unresolved": "error", // ensure import paths exist
    "import/no-duplicates": "error",
    "import/no-useless-path-segments": "error",

    // Optional: disallow default export in favor of named exports
    "import/no-default-export": "off",

    // Optional: ban extraneous deps (requires settings below)
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.ts",
          "**/*.spec.ts",
          "**/vitest.config.*",
          "**/jest.config.*",
          "**/eslint.config.*",
          "**/vite.config.*"
        ]
      }
    ]
  },
  settings: {
    // Helps eslint-plugin-import resolve TS paths and types
    "import/resolver": {
      typescript: true,
      node: true
    }
  },
  ignorePatterns: ["dist/", "build/", "coverage/"]
};
