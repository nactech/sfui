import { createContext, useContext } from "react";
import type { Platform } from "/@/core/platform";

export type MenuNavVia = "keyboard" | "pointer";
export type MenuCloseReason = "select" | "escape" | "tab";

export const ROOT_VIEW = "root";

export interface MenuViewEntry {
  id: string;
  label: string;
  /** The submenu row in the parent view — focus returns here on Back. */
  trigger: HTMLElement | null;
}

/** iOS menu size: `pulldown` (from a button, 260 wide) or `context` (long-press on content, 290 wide). */
export type MenuVariant = "pulldown" | "context";

export interface MenuPanelContextValue {
  /** Resolved platform of the panel; items render the iOS anatomy when it is `ios`. */
  platform: Platform;
  currentView: string;
  exitingView: string | null;
  path: MenuViewEntry[];
  subHost: HTMLElement | null;
  openSub: (entry: MenuViewEntry, via: MenuNavVia) => void;
  goBack: (via: MenuNavVia) => void;
  registerLayer: (id: string, el: HTMLElement | null) => void;
  /** Called after an item's `onSelect`; closes the menu unless prevented or `closeOnSelect` is false. */
  itemSelected: (event: React.SyntheticEvent, closeOnSelect: boolean) => void;
}

export const MenuPanelContext = createContext<MenuPanelContextValue | null>(null);

export function useMenuPanel(component: string): MenuPanelContextValue {
  const ctx = useContext(MenuPanelContext);
  if (!ctx) throw new Error(`<${component}> must be rendered inside <Menu> or <MenuPanel>.`);
  return ctx;
}

export interface MenuRadioContextValue {
  value: string | undefined;
  select: (value: string) => void;
}

export const MenuRadioContext = createContext<MenuRadioContextValue | null>(null);
