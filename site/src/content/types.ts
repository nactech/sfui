import type { ComponentType, ReactNode } from "react";
import type { Platform } from "@nactech/sfui";

/**
 * The content model of a component page. One file per component in `site/src/content/components/<slug>.tsx`
 * exports a `ComponentDoc`; `registry.ts` lists them. Every page (Overview, Platforms, Usage, Accessibility,
 * API), the component index, the cover cards, the search and `components.json` are generated from it.
 *
 * Only `slug`, `name`, `group`, `summary`, `exports`, `platformSplit`, `Demo` and `api` are required —
 * that is a "stub". Everything else fills in the richer sections and they appear as soon as they exist.
 */
export interface ComponentDoc {
  /** URL segment: `/components/<slug>`. Also the promo image name: `promo/covers/<slug>.webp`. */
  slug: string;
  /** Display name ("Tab bar" style is fine; the API tables use the real export names). */
  name: string;
  group: ComponentGroup;
  /** One sentence. Shown on cards, in search and in `components.json`. */
  summary: string;
  /** `complete` pages have every tab written; `stub` pages show the demo, the API and a "help wanted" note. */
  docStatus: "complete" | "stub";
  /** Maturity of the component itself. */
  status: ComponentStatus;
  /** Named exports of `@nactech/sfui` this page documents, first = the main one. Drives the import line. */
  exports: string[];
  /**
   * `shared` — one implementation everywhere. `split` — an iOS implementation next to Android + Web.
   * `ios` — iOS-only component (it still renders on Android + Web, in their grammar).
   */
  platformSplit: PlatformSplit;

  /** Live demo. Receives the values of `controls` and the platform the frame forces. */
  Demo: ComponentType<DemoProps>;
  /** Small props panel next to the demo. Keep it to the 3–6 props people actually change. */
  controls?: ControlDef[];
  /** Background of the demo stage: the true-black canvas or a photo (for glass over content). */
  stage?: "canvas" | "photo";
  /** Optional snippet that mirrors the current controls (shown under the demo). */
  code?: (values: ControlValues) => string;
  /**
   * Live render for the cover card when there is no `promo/covers/<slug>.*` image. It is drawn at a small
   * size, non-interactive (`inert`). Defaults to `Demo` with the default control values.
   */
  Preview?: ComponentType;

  overview?: {
    /** What it is — one or two short paragraphs. */
    intro: ReactNode;
    whenToUse?: string[];
    whenNotToUse?: string[];
  };
  /** Gallery under the demo (each one rendered live). */
  variants?: VariantDoc[];

  platforms?: {
    /** Short explanation of what differs (or why it does not). */
    intro?: ReactNode;
    /** Renders inside each device frame. Defaults to `Demo` with default values. */
    Demo?: ComponentType<{ platform: Platform }>;
    /** Per-platform notes shown under each frame. */
    notes?: Partial<Record<Platform, string[]>>;
  };

  usage?: {
    guidelines?: string[];
    dos?: DoDont[];
    writing?: string[];
  };

  accessibility?: {
    intro?: ReactNode;
    /** Element → role / ARIA attributes. */
    roles?: { element: string; role: string; notes?: string }[];
    keyboard?: { keys: string[]; action: string }[];
    focus?: string[];
    reducedMotion?: string[];
    screenReader?: string[];
  };

  /** One table per exported component, maintained by hand from the TypeScript types. */
  api: ApiTable[];

  /** Storybook: the story `title` ("Components/Button") and the stories worth linking. */
  storybook?: { title: string; stories?: { name: string; export: string }[] };
  /** Source folder in the repo. Default: `src/components/<first export>`. */
  source?: string;
  /** Related component slugs. */
  related?: string[];
  /**
   * Explicit promo artwork paths relative to `site/public/` (e.g. `promo/covers/button-alt.webp`).
   * Usually leave these empty: `promo/covers/<slug>.*` and `promo/anatomy/<slug>.*` are picked up
   * automatically by the build (see `virtual:sfui-promo`).
   */
  cover?: string;
  anatomy?: string;
  /** Alt text for the anatomy diagram. */
  anatomyAlt?: string;
}

export type ComponentGroup = "Actions & selection" | "Inputs" | "Lists" | "Navigation" | "Overlays";
export const GROUP_ORDER: ComponentGroup[] = ["Actions & selection", "Inputs", "Lists", "Navigation", "Overlays"];

export type ComponentStatus = "stable" | "beta";
export type PlatformSplit = "shared" | "split" | "ios";

export type ControlValue = string | number | boolean;
export type ControlValues = Record<string, ControlValue>;

export interface DemoProps {
  values: ControlValues;
  /** Set when the demo renders inside a device frame (Platforms tab). Usually you can ignore it:
   *  the frame wraps the demo in `<ConfigProvider platform>`. */
  platform?: Platform;
}

interface ControlBase {
  /** Key in `values` (usually the prop name). */
  name: string;
  label?: string;
}

export type ControlDef =
  | (ControlBase & { type: "enum"; options: readonly string[]; default: string })
  | (ControlBase & { type: "boolean"; default: boolean })
  | (ControlBase & { type: "text"; default: string })
  | (ControlBase & { type: "number"; min: number; max: number; step?: number; default: number });

export interface VariantDoc {
  name: string;
  description?: string;
  render: () => ReactNode;
  /** Draw over the photo backdrop instead of the canvas. */
  stage?: "canvas" | "photo";
}

export interface DoDont {
  kind: "do" | "dont";
  /** The rule, short: "Use one primary action per view". */
  title: string;
  caption?: string;
  render: () => ReactNode;
  stage?: "canvas" | "photo";
}

export interface PropDoc {
  name: string;
  /** TypeScript type as written in the source (kept short). */
  type: string;
  default?: string;
  required?: boolean;
  description: string;
  /** Prop only has an effect on one implementation. */
  platform?: "ios" | "android-web";
}

export interface ApiTable {
  /** Export name: "Button", "MenuItem"… */
  component: string;
  description?: string;
  props: PropDoc[];
  /** "Also accepts every native `<button>` attribute." */
  extends?: string;
}

/**
 * Storybook id, mirroring Storybook's own rule: the title is lower-cased and sanitised as is
 * ("Components/TabBar" → `components-tabbar`), the export name is start-cased first
 * ("IOSRest" → "IOS Rest" → `ios-rest`).
 */
export function storyId(title: string, exportName?: string): string {
  const sanitize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const startCase = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
  const base = sanitize(title);
  return exportName ? `${base}--${sanitize(startCase(exportName))}` : base;
}
