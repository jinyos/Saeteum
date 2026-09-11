import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";
import importX from "eslint-plugin-import-x";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

const scopeTo = (dir, configs) =>
  configs.map((config) => ({
    ...config,
    files: (config.files ?? ["**/*.{js,jsx,mjs,cjs,ts,tsx}"]).map(
      (pattern) => `${dir}/${pattern}`,
    ),
  }));

const noParentImports = {
  files: ["apps/**/*.{ts,tsx}", "packages/**/*.ts"],
  plugins: { "import-x": importX },
  settings: {
    "import-x/resolver": {
      typescript: true,
    },
  },
  rules: {
    "import-x/no-relative-parent-imports": "error",
  },
};

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/coverage/**",
  ]),

  // apps/web — Next.js
  ...scopeTo("apps/web", nextVitals),
  ...scopeTo("apps/web", nextTs),
  {
    files: ["apps/web/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    settings: { next: { rootDir: "apps/web" } },
    rules: {
      // App Router 전용 프로젝트라 pages/ 디렉터리가 없다 — 모노레포 cwd 불일치로 인한 오탐 경고를 끈다.
      "@next/next/no-html-link-for-pages": "off",
    },
  },

  // apps/api, packages/shared — plain TypeScript
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["apps/api/**/*.ts", "packages/shared/**/*.ts"],
  })),
  {
    files: ["apps/api/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      sourceType: "commonjs",
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // tests/e2e — Playwright
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["tests/e2e/**/*.ts"],
  })),
  {
    files: ["tests/e2e/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: "commonjs",
    },
  },

  noParentImports,
  eslintConfigPrettier,
]);
