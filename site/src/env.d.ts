/// <reference types="vite/client" />

declare module "virtual:sfui-promo" {
  /** Paths relative to `site/public/` of the promo images that exist (see site/src/lib/promo.ts). */
  const manifest: {
    hero: string | null;
    covers: Record<string, string>;
    anatomy: Record<string, string>;
  };
  export default manifest;
}
