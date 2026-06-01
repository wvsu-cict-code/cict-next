import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals"; // Built-in to parse environments

export default [
  {
    ignores: [".next/*", "out/*", "build/*", "node_modules/*", "next-env.d.ts"],
  },

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      // FIXES: 'window', 'fetch', 'process', 'console' not defined errors
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        React: "writable", // Allows omitting global React imports
      },
    },
    // FIXES: React version warning
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "@js": js,
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // ==========================================
      // ADAPTIVE CALMDOWN RULES (Prevents build failures)
      // ==========================================
      "no-undef": "off", // Turned off because TypeScript checking covers true undefined globals safely
      "@typescript-eslint/no-explicit-any": "warn", // Softened from 'error' for your dynamic API data fetching
      "react/prop-types": "off", // Handled implicitly by TypeScript types anyway
      "react-hooks/exhaustive-deps": "warn", // Downgraded complex dependency loops to warnings

      // Mutes strict functional side-effect blocks on advanced layout animations
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",

      // ==========================================
      // ACCESSIBILITY & SEO (Maintained for Compliance)
      // ==========================================
      "jsx-a11y/alt-text": ["error", { elements: ["img"] }],
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/iframe-has-title": "error",
      "jsx-a11y/anchor-is-valid": ["warn", { aspects: ["preferButton"] }],
      "react/no-unescaped-entities": "warn", // Changed to warning so stray quotes won't crash your content build

      // ==========================================
      // PERFORMANCE
      // ==========================================
      "@next/next/no-img-element": "warn", // Changed to warning so you can fix your <img> to <Image /> components iteratively
      "@next/next/google-font-display": "error",
      "@next/next/no-sync-scripts": "error",

      // ==========================================
      // CLEANUP
      // ==========================================
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react/self-closing-comp": "error",
      "react/react-in-jsx-scope": "off",
    },
  },

  eslintConfigPrettier,
];
