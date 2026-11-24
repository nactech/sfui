import React, { useState } from "react";
import { ThemeContext, useSystemTheme } from "../../core/theme";
import type { Appearance } from "../../core/theme";

export interface ConfigProviderProps {
  children?: React.ReactNode;
  /** Black Glass is dark-only for now; `light` is reserved for a future light theme. */
  appearance?: Appearance;
}

const ConfigProvider = ({ children, appearance: initial }: ConfigProviderProps) => {
  const system = useSystemTheme();
  const [appearance, setAppearanceState] = useState<Appearance>(initial ?? system);
  const setAppearance = (next?: Appearance) =>
    setAppearanceState((current) => next ?? (current === "light" ? "dark" : "light"));

  return <ThemeContext.Provider value={{ appearance, setAppearance }}>{children}</ThemeContext.Provider>;
};

export default ConfigProvider;
