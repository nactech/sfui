import manifest from "virtual:sfui-promo";
import type { ComponentDoc } from "@site/content/types";
import { asset } from "./links";

/**
 * Promo artwork slots. Images are designed separately and exported into `site/public/promo/`:
 *
 *   promo/hero.{webp,png,…}            home hero still (shown in the "In context" band; hidden when absent)
 *   promo/covers/<slug>.{webp,png,…}   component cover card, 16:10 (falls back to a live mini-preview)
 *   promo/anatomy/<slug>.{webp,png,…}  anatomy diagram on the Overview tab (section hidden when absent)
 *
 * The build scans the folder (see `site/plugins/sfui-site.ts`), so dropping a file in is enough.
 * A `ComponentDoc` can point at a differently named file with `cover` / `anatomy`.
 */
export function coverFor(doc: ComponentDoc): string | null {
  const path = doc.cover ?? manifest.covers[doc.slug];
  return path ? asset(path) : null;
}

export function anatomyFor(doc: ComponentDoc): string | null {
  const path = doc.anatomy ?? manifest.anatomy[doc.slug];
  return path ? asset(path) : null;
}

export const heroStill: string | null = manifest.hero ? asset(manifest.hero) : null;
