module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "commonjs"
  },
  extends: [
    "eslint:recommended"
  ],
  overrides: [
    {
      files: ["*.js", "*.cjs"],
      rules: {
        // Disable rules that cause issues with CommonJS
        "no-undef": "off", 
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-var-requires": "off",
        "no-console": "off",
        "@typescript-eslint/no-unused-vars": "warn"
      }
    },
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        projectService: true,
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
        "unused-imports"
      ],
      extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier"
      ],
      rules: {
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
        "react/prop-types": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "off"
      },
      settings: {
        react: {
          version: "detect",
        },
      }
    }
  ]
};
