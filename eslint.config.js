// Flat ESLint config
// - Ignore scripts/** to silence lint in utility scripts
// - Parse TS/TSX correctly to avoid “Unexpected token interface/:” errors

import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
	// Global ignore patterns
	{
		ignores: [
			"dist/**",
			"build/**",
			"**/dist/**",
			"**/build/**",
			"scripts/**", // silence linting for scripts
		],
	},

	// Base recommended rules for JS
	js.configs.recommended,

	// TypeScript support for src/**/*
	...tseslint.config({
		files: ["src/**/*.{ts,tsx}", "*.{ts,tsx}"],
		extends: [
			...tseslint.configs.recommended,
			...tseslint.configs.stylistic,
		],
		languageOptions: {
			parserOptions: {
				project: false,
				ecmaVersion: "latest",
				sourceType: "module",
			},
		},
		rules: {
			// keep light; main enforcement is via TypeScript
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
		},
	}),
];
