/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Shared by Storybook and Vitest. The library itself is built by Rollup (rollup.config.mjs).
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
    preprocessorOptions: {
      // Lets every component write `@use "mixins" as *;` / `@use "functions" as *;`.
      scss: { loadPaths: [path.resolve(import.meta.dirname, "src/core/styles")] },
    },
  },
  resolve: {
    alias: [{ find: /^\/@\//, replacement: `${path.resolve(import.meta.dirname, "src")}/` }],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
