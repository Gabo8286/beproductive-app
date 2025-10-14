import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage", ".husky", "scripts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "import": importPlugin,
      "unused-imports": unusedImports,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
    },
    rules: {
      // React & TypeScript Rules
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off", // Handled by unused-imports
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "no-async-promise-executor": "warn",
      "no-case-declarations": "warn",
      "no-constant-binary-expression": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "prefer-const": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "no-useless-catch": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "@typescript-eslint/triple-slash-reference": "warn",

      // FMEW Import Consistency Rules (FM-02 Countermeasure)
      "import/order": [
        "error",
        {
          groups: [
            "builtin",   // Node.js built-ins
            "external",  // npm packages
            "internal",  // Internal modules (using @ alias)
            "parent",    // Parent directory imports
            "sibling",   // Same directory imports
            "index",     // Index file imports
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // Import/Export Rules
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/namespace": "error",
      "import/no-absolute-path": "error",
      "import/no-dynamic-require": "error",
      "import/no-self-import": "error",
      "import/no-cycle": "error",
      "import/no-useless-path-segments": "error",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],

      // Unused Imports (FMEW Dependency Drift Prevention)
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // FMEW Specific Rules for Code Quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",

      // TypeScript Specific Enhancements
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      "@typescript-eslint/consistent-type-exports": [
        "error",
        {
          fixMixedExportsWithInlineTypeSpecifier: false,
        },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",

      // FMEW Performance Rules
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/prefer-as-const": "error",

      // FMEW Security Rules (FM-05 Countermeasure)
      "no-unsafe-finally": "error",
      "no-unsafe-negation": "error",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
    },
  },

  // Special configuration for scripts directory
  {
    files: ["scripts/**/*.{js,ts}"],
    rules: {
      "no-console": "off", // Allow console in scripts
      "@typescript-eslint/no-require-imports": "off", // Allow require in scripts
      "import/no-dynamic-require": "off", // Allow dynamic require in scripts
    },
  },

  // Special configuration for test files
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/test/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // More lenient in tests
      "import/no-unresolved": "off", // Test utilities might not resolve
      "@typescript-eslint/no-unsafe-assignment": "off", // Allow in tests
      "@typescript-eslint/no-unsafe-member-access": "off", // Allow in tests
    },
  },
);
