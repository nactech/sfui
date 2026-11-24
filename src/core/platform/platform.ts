import { createContext, useContext, useMemo } from "react";

/**
 * Which native grammar a component follows. Black Glass has platform-specific implementations
 * where native conventions differ (Slider, Tab bar, Header, Menu):
 * - `ios` — the iOS frames of final.pen (system font, chevron back, glass lens, iOS menus);
 * - `android` / `web` — the "Android + Web" frames (web adds hover, keyboard and wide layouts).
 * Components without a split render the same everywhere.
 */
export type Platform = "ios" | "android" | "web";
export type PlatformSetting = Platform | "auto";

type NavigatorLike = Pick<Navigator, "userAgent" | "maxTouchPoints"> & {
  userAgentData?: { platform?: string };
};

/** Detects the platform from the user agent. iPadOS reports a Mac UA, so touch support decides. */
export function detectPlatform(nav: NavigatorLike | undefined = typeof navigator === "undefined" ? undefined : navigator): Platform {
  if (!nav) return "web";
  const ua = nav.userAgent ?? "";
  const uaPlatform = nav.userAgentData?.platform ?? "";
  if (/iPhone|iPad|iPod/i.test(ua) || /iOS/i.test(uaPlatform)) return "ios";
  if (/Macintosh/i.test(ua) && (nav.maxTouchPoints ?? 0) > 1) return "ios";
  if (/Android/i.test(ua) || /Android/i.test(uaPlatform)) return "android";
  return "web";
}

/** `null` = no ConfigProvider above: fall back to detection. */
export const PlatformContext = createContext<Platform | null>(null);

/**
 * Resolves the platform for a component: explicit prop → nearest ConfigProvider → user agent.
 * Pass the component's own `platform` prop as `override`.
 */
export function usePlatform(override?: PlatformSetting): Platform {
  const fromContext = useContext(PlatformContext);
  const detected = useMemo(() => detectPlatform(), []);
  if (override && override !== "auto") return override;
  return fromContext ?? detected;
}

/** True when the iOS implementation should render. */
export function useIsIOS(override?: PlatformSetting): boolean {
  return usePlatform(override) === "ios";
}
