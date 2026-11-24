import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import libraryConfig from "../vite.config.ts";
import { sfuiSite } from "./plugins/sfui-site.ts";

/**
 * SF UI documentation site (Vite + React 19). Deployed to GitHub Pages under /sfui/; Storybook lives at
 * /sfui/storybook/. The library is imported from source so the site always shows the current code.
 */
const siteRoot = import.meta.dirname;
const librarySrc = path.resolve(siteRoot, "../src");
const libraryScss = libraryConfig.css?.preprocessorOptions?.scss as { loadPaths?: string[] } | undefined;

export default defineConfig({
  root: siteRoot,
  base: "/sfui/",
  publicDir: path.join(siteRoot, "public"),
  plugins: [react(), sfuiSite()],
  css: {
    // Same CSS-module naming as the library (Storybook / Vitest / Rollup).
    modules: libraryConfig.css?.modules,
    preprocessorOptions: {
      // `@use "mixins"`, `@use "functions"`, `@use "tokens"` resolve from the library; site partials from site/src/styles.
      scss: { loadPaths: [...(libraryScss?.loadPaths ?? []), path.join(siteRoot, "src/styles")] },
    },
  },
  resolve: {
    alias: [
      { find: /^\/@\//, replacement: `${librarySrc}/` },
      { find: /^@nactech\/sfui$/, replacement: path.join(librarySrc, "index.ts") },
      { find: /^@site\//, replacement: `${path.join(siteRoot, "src")}/` },
    ],
  },
  server: { port: 5190, strictPort: false },
  preview: { port: 4190, strictPort: false },
  build: {
    outDir: path.join(siteRoot, "dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
});
