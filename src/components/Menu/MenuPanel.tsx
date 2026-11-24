import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import classes from "./Menu.module.scss";
import { buildClassName } from "/@/core/util";
import { usePlatform, type PlatformSetting } from "/@/core/platform";
import {
  MenuPanelContext,
  ROOT_VIEW,
  type MenuCloseReason,
  type MenuNavVia,
  type MenuPanelContextValue,
  type MenuVariant,
  type MenuViewEntry,
} from "./context";
import { focusElement, getEnabledItems, getRows, itemText } from "./dom";
import { canAnimate, runViewTransition, type MenuNavDirection } from "./motion";
import { usePressLens } from "./pressLens";

export interface MenuPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
  /** Asked to close: an item was selected, Esc on the root view, or Tab. `Menu` wires this up;
   *  an inline panel can ignore it. */
  onRequestClose?: (reason: MenuCloseReason) => void;
  /** `ios` renders the iOS 26 menu (final.pen M/A1): SF font, check column, sliding press lens, no hover.
   *  `android` / `web` render M/A2. Default: nearest `ConfigProvider platform`, else the user agent. */
  platform?: PlatformSetting;
  /** iOS only (ignored on Android / Web): `pulldown` (260 wide, from a button) or `context`
   *  (290 wide, under a lifted preview). Default `"pulldown"`. */
  variant?: MenuVariant;
}

interface PendingTransition {
  from: string;
  to: string;
  direction: MenuNavDirection;
  fromHeight: number;
  via: MenuNavVia;
  /** Focus target after the switch (keyboard Back → the submenu row). */
  focusTarget: HTMLElement | null;
}

const TYPEAHEAD_RESET = 500;

const heightOf = (el: HTMLElement | null) => el?.getBoundingClientRect().height ?? 0;

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

/** In-place layer: the root view or one submenu view. Inactive views stay mounted (they host nested
 *  submenu portals) but are `hidden`. The exiting view is taken out of flow and made inert. */
export function MenuLayer({ viewId, children }: { viewId: string; children?: React.ReactNode }) {
  const ctx = React.useContext(MenuPanelContext);
  const register = ctx?.registerLayer;
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      register?.(viewId, el);
      return () => register?.(viewId, null);
    },
    [register, viewId],
  );
  const state = !ctx || ctx.currentView === viewId ? "active" : ctx.exitingView === viewId ? "exiting" : "inactive";
  return (
    <div
      ref={setRef}
      role="none"
      className={classes.layer}
      data-menu-layer=""
      data-state={state}
      hidden={state === "inactive"}
      aria-hidden={state === "exiting" || undefined}
      inert={state === "exiting"}
    >
      {children}
    </div>
  );
}

/** The static Black Glass menu panel (final.pen `Menu/Android+Web`, `Menu/iOS`): no trigger, no positioning.
 *  Owns in-place submenu navigation, keyboard roving focus and (iOS) the sliding press lens. */
const MenuPanel = ({
  children,
  ref,
  className,
  onKeyDown,
  onRequestClose,
  platform,
  variant = "pulldown",
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClickCapture,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...rest
}: MenuPanelProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const layersRef = useRef(new Map<string, HTMLElement>());
  const pendingRef = useRef<PendingTransition | null>(null);
  const animationsRef = useRef<Animation[]>([]);
  const transitionIdRef = useRef(0);
  const quickColRef = useRef(0);
  const typeaheadRef = useRef<{ buffer: string; timer: ReturnType<typeof setTimeout> | undefined }>({
    buffer: "",
    timer: undefined,
  });

  const [path, setPath] = useState<MenuViewEntry[]>([]);
  const [exitingView, setExitingView] = useState<string | null>(null);
  const [subHost, setSubHost] = useState<HTMLDivElement | null>(null);

  const currentEntry = path.length ? path[path.length - 1] : undefined;
  const currentView = currentEntry?.id ?? ROOT_VIEW;
  const resolvedPlatform = usePlatform(platform);
  const ios = resolvedPlatform === "ios";

  const getActiveLayer = useCallback(() => layersRef.current.get(currentView), [currentView]);
  const { lensRef, handlers: lens } = usePressLens({ enabled: ios, getLayer: getActiveLayer, viewKey: currentView });

  const setPanelRef = useCallback(
    (el: HTMLDivElement | null) => {
      panelRef.current = el;
      assignRef(ref, el);
    },
    [ref],
  );

  const registerLayer = useCallback((id: string, el: HTMLElement | null) => {
    if (el) layersRef.current.set(id, el);
    else layersRef.current.delete(id);
  }, []);

  // Mirrors `path` so navigation handlers can compute transitions without impure state updaters.
  const pathRef = useRef<MenuViewEntry[]>([]);

  const openSub = useCallback((entry: MenuViewEntry, via: MenuNavVia) => {
    const prev = pathRef.current;
    if (prev.some((e) => e.id === entry.id)) return;
    const from = prev.length ? prev[prev.length - 1].id : ROOT_VIEW;
    const next = [...prev, entry];
    pathRef.current = next;
    pendingRef.current = { from, to: entry.id, direction: "forward", fromHeight: heightOf(panelRef.current), via, focusTarget: null };
    setExitingView(from);
    setPath(next);
  }, []);

  const goBack = useCallback((via: MenuNavVia) => {
    const prev = pathRef.current;
    if (!prev.length) return;
    const leaving = prev[prev.length - 1];
    const next = prev.slice(0, -1);
    pathRef.current = next;
    pendingRef.current = {
      from: leaving.id,
      to: next.length ? next[next.length - 1].id : ROOT_VIEW,
      direction: "back",
      fromHeight: heightOf(panelRef.current),
      via,
      focusTarget: leaving.trigger,
    };
    setExitingView(leaving.id);
    setPath(next);
  }, []);

  const itemSelected = useCallback(
    (event: React.SyntheticEvent, closeOnSelect: boolean) => {
      if (closeOnSelect && !event.defaultPrevented) onRequestClose?.("select");
    },
    [onRequestClose],
  );

  // Run the shared-axis transition once the new view is committed.
  useLayoutEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    const panel = panelRef.current;
    const from = layersRef.current.get(pending.from);
    const to = layersRef.current.get(pending.to);

    if (pending.via === "keyboard") {
      const target =
        pending.direction === "back" && pending.focusTarget?.isConnected
          ? pending.focusTarget
          : (getEnabledItems(to).find((el) => !el.hasAttribute("data-menu-back")) ?? getEnabledItems(to)[0]);
      focusElement(target ?? panel);
    } else {
      focusElement(panel);
    }

    animationsRef.current.forEach((a) => a.cancel());
    animationsRef.current = [];
    const id = ++transitionIdRef.current;
    const finish = () => {
      if (transitionIdRef.current !== id) return;
      // Hide the outgoing view first, then drop the filled keyframes so nothing lingers on the layers.
      flushSync(() => setExitingView(null));
      animationsRef.current.forEach((a) => a.cancel());
      animationsRef.current = [];
    };

    if (!panel || !canAnimate(from) || !canAnimate(to)) {
      setExitingView(null);
      return;
    }
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const animations = runViewTransition({
      panel,
      from,
      to,
      fromHeight: pending.fromHeight,
      direction: pending.direction,
      rootFontSize,
    });
    animationsRef.current = animations;
    Promise.all(animations.map((a) => a.finished)).then(finish, () => {
      /* cancelled by a newer transition */
    });
  }, [currentView]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const layer = layersRef.current.get(currentView);
    if (!layer) return;
    const items = getEnabledItems(layer);
    const rows = getRows(items);
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const rowIndex = active ? rows.findIndex((row) => row.includes(active)) : -1;
    const row = rowIndex >= 0 ? rows[rowIndex] : undefined;
    const col = row && active ? row.indexOf(active) : -1;
    const inQuickRow = !!active && rowIndex >= 0 && active.hasAttribute("data-menu-quick");

    const focusRow = (index: number, edge?: "first" | "last") => {
      if (!rows.length) return;
      const target = rows[(index + rows.length) % rows.length];
      const isQuick = target[0].hasAttribute("data-menu-quick");
      const c = edge === "first" ? 0 : edge === "last" ? target.length - 1 : isQuick ? quickColRef.current : 0;
      focusElement(target[Math.min(c, target.length - 1)]);
    };
    const leaveQuickRow = () => {
      if (inQuickRow) quickColRef.current = col;
    };

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        leaveQuickRow();
        // Entering the quick row downwards lands on its first action; upwards, on the column last left.
        focusRow(rowIndex < 0 ? 0 : rowIndex + 1, "first");
        return;
      case "ArrowUp":
        event.preventDefault();
        leaveQuickRow();
        focusRow(rowIndex < 0 ? rows.length - 1 : rowIndex - 1);
        return;
      case "Home":
        event.preventDefault();
        focusRow(0, "first");
        return;
      case "End":
        event.preventDefault();
        focusRow(rows.length - 1, "last");
        return;
      case "ArrowRight":
        event.preventDefault();
        if (inQuickRow && row) focusElement(row[(col + 1) % row.length]);
        else if (active?.hasAttribute("data-menu-sub-trigger")) active.click();
        return;
      case "ArrowLeft":
        event.preventDefault();
        if (inQuickRow && row) focusElement(row[(col - 1 + row.length) % row.length]);
        else if (path.length) goBack("keyboard");
        return;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        if (path.length) goBack("keyboard");
        else onRequestClose?.("escape");
        return;
      case "Tab":
        if (onRequestClose) {
          event.preventDefault();
          onRequestClose("tab");
        }
        return;
    }

    // Typeahead: printable characters jump to the next item whose label starts with the typed text.
    if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const ta = typeaheadRef.current;
      clearTimeout(ta.timer);
      ta.buffer += event.key.toLowerCase();
      ta.timer = setTimeout(() => {
        ta.buffer = "";
      }, TYPEAHEAD_RESET);
      // Repeating one character ("d", "d") cycles through the items starting with it.
      const repeated = ta.buffer.split("").every((c) => c === ta.buffer[0]);
      const query = repeated ? ta.buffer[0] : ta.buffer;
      const current = active ? items.indexOf(active) : -1;
      const start = query.length === 1 ? current + 1 : Math.max(current, 0);
      for (let i = 0; i < items.length; i++) {
        const candidate = items[(start + i) % items.length];
        if (itemText(candidate).startsWith(query)) {
          if (candidate.hasAttribute("data-menu-quick")) {
            const quickRow = rows.find((r) => r.includes(candidate));
            if (quickRow) quickColRef.current = quickRow.indexOf(candidate);
          }
          focusElement(candidate);
          break;
        }
      }
    }
  };

  const ctx = useMemo<MenuPanelContextValue>(
    () => ({ platform: resolvedPlatform, currentView, exitingView, path, subHost, openSub, goBack, registerLayer, itemSelected }),
    [resolvedPlatform, currentView, exitingView, path, subHost, openSub, goBack, registerLayer, itemSelected],
  );

  return (
    <MenuPanelContext.Provider value={ctx}>
      <div
        ref={setPanelRef}
        role="menu"
        aria-orientation="vertical"
        tabIndex={-1}
        aria-label={currentEntry ? currentEntry.label : ariaLabel}
        aria-labelledby={currentEntry ? undefined : ariaLabelledBy}
        data-view={currentView === ROOT_VIEW ? "root" : "submenu"}
        data-platform={resolvedPlatform}
        data-variant={ios ? variant : undefined}
        className={buildClassName(classes.panel, className)}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (!event.defaultPrevented) lens.onPointerDown(event);
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          lens.onPointerMove(event);
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          lens.onPointerUp(event);
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          lens.onPointerCancel(event);
        }}
        onClickCapture={(event) => {
          lens.onClickCapture(event);
          if (!event.isPropagationStopped()) onClickCapture?.(event);
        }}
        {...rest}
      >
        <div className={classes.viewport} role="none">
          {ios && <span ref={lensRef} className={classes.pressLens} data-menu-press-lens="" aria-hidden="true" />}
          <MenuLayer viewId={ROOT_VIEW}>{children}</MenuLayer>
          <div ref={setSubHost} className={classes.subHost} role="none" />
        </div>
      </div>
    </MenuPanelContext.Provider>
  );
};

export default MenuPanel;
