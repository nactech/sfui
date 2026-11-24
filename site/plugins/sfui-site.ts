import fs from "node:fs";
import path from "node:path";
import { createServer, type Plugin, type ResolvedConfig } from "vite";

/**
 * Site-only build glue:
 *
 * 1. `virtual:sfui-promo` — a manifest of the promo artwork dropped into `site/public/promo/`
 *    (`hero.*`, `covers/<slug>.*`, `anatomy/<slug>.*`). Pages ask it whether an image exists, so a missing
 *    cover falls back to the live mini-preview and a missing anatomy diagram hides its section.
 *    Adding or removing a file reloads the dev server.
 * 2. `components.json` — a machine-readable index of every component page (name, slug, summary, import,
 *    props, platforms, Storybook link) for agents and tools. Served in dev, written into the build output.
 * 3. `404.html` — a copy of `index.html`, so GitHub Pages serves the SPA for deep links.
 */

const PROMO_ID = "virtual:sfui-promo";
const RESOLVED_PROMO_ID = `\0${PROMO_ID}`;
/** Preferred first when one slot has several formats. */
const IMAGE_EXTENSIONS = [".avif", ".webp", ".png", ".jpg", ".jpeg", ".svg", ".gif"];
const MANIFEST_MODULE = "/src/content/manifest.ts";

export interface PromoManifest {
  hero: string | null;
  covers: Record<string, string>;
  anatomy: Record<string, string>;
}

const rank = (file: string) => {
  const i = IMAGE_EXTENSIONS.indexOf(path.extname(file).toLowerCase());
  return i < 0 ? Infinity : i;
};

function imagesIn(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => rank(file) !== Infinity && !file.startsWith("."))
    .sort((a, b) => rank(a) - rank(b));
}

export function scanPromo(promoDir: string): PromoManifest {
  const manifest: PromoManifest = { hero: null, covers: {}, anatomy: {} };
  for (const file of imagesIn(promoDir)) {
    if (!manifest.hero && path.parse(file).name === "hero") manifest.hero = `promo/${file}`;
  }
  for (const slot of ["covers", "anatomy"] as const) {
    for (const file of imagesIn(path.join(promoDir, slot))) {
      const slug = path.parse(file).name;
      manifest[slot][slug] ??= `promo/${slot}/${file}`;
    }
  }
  return manifest;
}

export function sfuiSite(): Plugin {
  let config: ResolvedConfig;
  let promoDir = "";

  return {
    name: "sfui-site",

    configResolved(resolved) {
      config = resolved;
      promoDir = path.join(resolved.publicDir || path.join(resolved.root, "public"), "promo");
    },

    resolveId(id) {
      return id === PROMO_ID ? RESOLVED_PROMO_ID : undefined;
    },

    load(id) {
      if (id !== RESOLVED_PROMO_ID) return undefined;
      return `export default ${JSON.stringify(scanPromo(promoDir))};`;
    },

    configureServer(server) {
      // New / removed promo images: rebuild the manifest and reload.
      server.watcher.add(promoDir);
      const onChange = (file: string) => {
        if (!file.startsWith(promoDir)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_PROMO_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", onChange);
      server.watcher.on("unlink", onChange);

      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? "").split("?")[0];
        if (url !== `${config.base}components.json` && url !== "/components.json") return next();
        try {
          const mod = await server.ssrLoadModule(MANIFEST_MODULE);
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(mod.buildComponentsManifest(), null, 2));
        } catch (error) {
          next(error);
        }
      });
    },

    async closeBundle() {
      if (config.command !== "build" || config.build.ssr) return;
      const outDir = path.resolve(config.root, config.build.outDir);
      const indexHtml = path.join(outDir, "index.html");
      if (fs.existsSync(indexHtml)) fs.copyFileSync(indexHtml, path.join(outDir, "404.html"));

      // Load the content registry through Vite (TSX, SCSS modules, aliases) and serialise it.
      const server = await createServer({
        configFile: config.configFile,
        root: config.root,
        logLevel: "error",
        appType: "custom",
        server: { middlewareMode: true, hmr: false, ws: false, watch: null },
        optimizeDeps: { noDiscovery: true, include: [] },
      });
      try {
        const mod = await server.ssrLoadModule(MANIFEST_MODULE);
        const manifest = mod.buildComponentsManifest();
        fs.writeFileSync(path.join(outDir, "components.json"), `${JSON.stringify(manifest, null, 2)}\n`);
        config.logger.info(`  components.json: ${manifest.components.length} components`);
      } finally {
        await server.close();
      }
    },
  };
}
