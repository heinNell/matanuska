module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    // ------- BLOCK ON 'Mock' -------
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Identifier[name=/Mock/i]",
        "message": "Do not use identifiers containing 'Mock'."
      },
      {
        "selector": "Literal[value=/Mock/i]",
        "message": "Do not use literals containing 'Mock'."
      }
    ]
    // ------- END BLOCK -------
  },
};
