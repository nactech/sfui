import React, { useMemo, useState } from "react";
import { ThemeContext, useSystemTheme } from "../../core/theme";
import type { Appearance } from "../../core/theme";
import { PlatformContext, detectPlatform } from "../../core/platform";
import type { PlatformSetting } from "../../core/platform";

export interface ConfigProviderProps {
  children?: React.ReactNode;
  /** Black Glass is dark-only for now; `light` is reserved for a future light theme. */
  appearance?: Appearance;
  /**
   * Which platform implementation components render (Slider, TabBar, Header, Menu).
   * `auto` (default) detects iOS (iPhone, iPad) and Android from the user agent; everything else is `web`.
   */
  platform?: PlatformSetting;
}

const ConfigProvider = ({ children, appearance: initial, platform = "auto" }: ConfigProviderProps) => {
  const system = useSystemTheme();
  const [appearance, setAppearanceState] = useState<Appearance>(initial ?? system);
  const setAppearance = (next?: Appearance) =>
    setAppearanceState((current) => next ?? (current === "light" ? "dark" : "light"));
  const resolvedPlatform = useMemo(() => (platform === "auto" ? detectPlatform() : platform), [platform]);

  return (
    <ThemeContext.Provider value={{ appearance, setAppearance }}>
      <PlatformContext.Provider value={resolvedPlatform}>{children}</PlatformContext.Provider>
    </ThemeContext.Provider>
  );
};

export default ConfigProvider;
