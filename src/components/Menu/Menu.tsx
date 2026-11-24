import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import classes from "./Menu.module.scss";
import { buildClassName } from "/@/core/util";
import { usePlatform } from "/@/core/platform";
import MenuPanel, { type MenuPanelProps } from "./MenuPanel";
import type { MenuCloseReason } from "./context";
import { focusElement, getEnabledItems } from "./dom";
import { computeMenuPosition, MENU_CONTEXT_OFFSET, type MenuAlign, type MenuPosition } from "./position";

/** Props `Menu` wires onto the trigger element. */
export interface MenuTriggerProps {
  ref?: React.Ref<HTMLElement>;
  id?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  /** iOS context menu: long-press opens. */
  onPointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<HTMLElement>) => void;
  /** iOS context menu: right-click / the context-menu key (and Android long-press) open. */
  onContextMenu?: (event: React.MouseEvent<HTMLElement>) => void;
  "aria-haspopup"?: React.AriaAttributes["aria-haspopup"];
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  /** `open` while the menu is shown — style the lifted preview of a context menu with it. */
  "data-state"?: "open" | "closed";
}

export interface MenuProps extends Omit<MenuPanelProps, "onRequestClose"> {
  /** The anchor, usually an icon button (•••). Gets `aria-haspopup="menu"`, `aria-expanded`, `data-state`,
   *  ref and handlers. For an iOS `context` menu it is the content that gets long-pressed (the preview). */
  trigger: React.ReactElement<MenuTriggerProps>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which anchor edge the panel lines up with. Default `"end"` (final.pen: right edges aligned under •••);
   *  an iOS `context` menu defaults to `"center"` (centred under its preview). */
  align?: MenuAlign;
  /**
   * iOS only (ignored on Android / Web, which always open a pull-down below the trigger):
   * - `pulldown` (default) — 260 wide, grows out of the trigger and covers it (top edges aligned);
   * - `context` — 290 wide, 12 below the long-pressed content (the lifted preview), background stays sharp.
   *   Opens on long-press (≈500 ms), right-click, the context-menu key / Shift+F10, or ↓ / ↑ on the focused
   *   trigger; a tap / Enter / Space stays the content's own action (its `onClick`).
   */
  variant?: MenuPanelProps["variant"];
}

type FocusIntent = "first" | "last" | "panel";

interface PanelPosition extends MenuPosition {
  /** px → rem divisor (the document's root font size). */
  rootFontSize: number;
  /** iOS: the trigger's centre relative to the panel's anchored corner (transform-origin of the grow-in). */
  originX: number;
  originY: number;
}

/** iOS context menu: hold this long to open (UIContextMenuInteraction ≈ 0.5 s) … */
const LONG_PRESS_MS = 500;
/** … without moving the finger further than this (px). */
const LONG_PRESS_SLOP = 10;

const activeLayer = (panel: HTMLElement | null) =>
  panel?.querySelector<HTMLElement>('[data-menu-layer][data-state="active"]') ?? null;

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

/** Menu root: trigger + floating Black Glass panel, portaled to `document.body`, opened below its anchor. */
const Menu = ({
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  align: alignProp,
  platform,
  variant = "pulldown",
  ref,
  className,
  style,
  children,
  ...panelProps
}: MenuProps) => {
  const resolvedPlatform = usePlatform(platform);
  const ios = resolvedPlatform === "ios";
  const context = ios && variant === "context";
  const align: MenuAlign = alignProp ?? (context ? "center" : "end");
  const generatedId = useId();
  const panelId = `${generatedId}-menu`;
  const triggerId = trigger.props.id ?? `${generatedId}-trigger`;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open !== undefined ? open : uncontrolledOpen;
  const [position, setPosition] = useState<PanelPosition | null>(null);

  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const focusIntentRef = useRef<FocusIntent>("panel");
  const longPressRef = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number; pointerId: number } | null>(null);
  /** Set when a long-press opened the menu: the click that ends the same press must not toggle it. */
  const swallowClickRef = useRef(false);

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  const childRef = trigger.props.ref;
  const setTriggerRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      assignRef(childRef, node);
    },
    [childRef],
  );

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  const requestClose = useCallback(
    (reason: MenuCloseReason) => {
      setOpen(false);
      if (reason === "select" || reason === "escape" || reason === "tab") focusElement(triggerRef.current);
    },
    [setOpen],
  );

  const updatePosition = useCallback(() => {
    const anchor = triggerRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const layer = activeLayer(panel);
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const anchorRect = anchor.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const pos = computeMenuPosition({
      anchor: anchorRect,
      panelWidth: panel.offsetWidth,
      panelHeight: layer ? layer.offsetHeight + 2 : panel.offsetHeight, // + 1px rims
      viewportWidth: document.documentElement.clientWidth || window.innerWidth,
      viewportHeight,
      align,
      direction: getComputedStyle(anchor).direction === "rtl" ? "rtl" : "ltr",
      // iOS pull-down grows out of the ••• button and covers it; a context menu sits under its preview.
      cover: ios && !context,
      offset: context ? MENU_CONTEXT_OFFSET : undefined,
    });
    const next: PanelPosition = {
      ...pos,
      rootFontSize,
      originX: (anchorRect.left + anchorRect.right) / 2 - pos.left,
      // From the anchored edge: top edge when opening down, bottom edge when opening up.
      originY:
        pos.top !== undefined
          ? (anchorRect.top + anchorRect.bottom) / 2 - pos.top
          : viewportHeight - (pos.bottom ?? 0) - (anchorRect.top + anchorRect.bottom) / 2,
    };
    setPosition((prev) =>
      prev &&
      prev.placement === next.placement &&
      prev.left === next.left &&
      prev.top === next.top &&
      prev.bottom === next.bottom &&
      prev.maxHeight === next.maxHeight &&
      prev.rootFontSize === next.rootFontSize &&
      prev.originX === next.originX &&
      prev.originY === next.originY
        ? prev
        : next,
    );
  }, [align, ios, context]);

  // Position before paint, and keep it attached to the anchor on scroll / resize.
  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // Initial focus: first/last item when opened from the keyboard, otherwise the panel itself
  // (so arrows and Esc work without drawing a focus ring on an item).
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    const items = getEnabledItems(activeLayer(panel));
    const intent = focusIntentRef.current;
    focusIntentRef.current = "panel";
    focusElement(intent === "first" ? items[0] : intent === "last" ? items[items.length - 1] : panel);
  }, [isOpen]);

  // Outside pointer closes (focus stays where the user clicked).
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isOpen, setOpen]);

  const cancelLongPress = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current.timer);
    longPressRef.current = null;
  };
  useEffect(() => cancelLongPress, []);

  const openFromPointer = () => {
    focusIntentRef.current = "panel";
    setOpen(true);
  };

  const triggerElement = React.cloneElement(trigger, {
    ref: setTriggerRef,
    id: triggerId,
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? panelId : undefined,
    "data-state": isOpen ? "open" : "closed",
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      // The release of a long-press that opened the context menu is not a tap on the content.
      if (swallowClickRef.current && event.detail !== 0) {
        swallowClickRef.current = false;
        event.preventDefault();
        return;
      }
      trigger.props.onClick?.(event);
      if (event.defaultPrevented) return;
      if (isOpen) {
        setOpen(false);
        return;
      }
      // Activating a context-menu preview (tap, Enter, Space) is the content's own action (e.g. send the
      // sticker); its menu is the secondary action — long-press, right-click, context-menu key, ↓ / ↑.
      if (context) return;
      // `detail === 0`: Enter / Space on a native button.
      focusIntentRef.current = event.detail === 0 ? "first" : "panel";
      setOpen(true);
    },
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      trigger.props.onPointerDown?.(event);
      swallowClickRef.current = false;
      if (!context || isOpen || event.defaultPrevented || (event.pointerType === "mouse" && event.button !== 0)) return;
      cancelLongPress();
      longPressRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        timer: setTimeout(() => {
          longPressRef.current = null;
          swallowClickRef.current = true;
          openFromPointer();
        }, LONG_PRESS_MS),
      };
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      trigger.props.onPointerMove?.(event);
      const press = longPressRef.current;
      if (press && press.pointerId === event.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) > LONG_PRESS_SLOP) {
        cancelLongPress();
      }
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      trigger.props.onPointerUp?.(event);
      cancelLongPress();
    },
    onPointerCancel: (event: React.PointerEvent<HTMLElement>) => {
      trigger.props.onPointerCancel?.(event);
      cancelLongPress();
    },
    onContextMenu: (event: React.MouseEvent<HTMLElement>) => {
      trigger.props.onContextMenu?.(event);
      if (!context || event.defaultPrevented) return;
      event.preventDefault();
      cancelLongPress();
      if (!isOpen) openFromPointer();
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      trigger.props.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        focusIntentRef.current = event.key === "ArrowDown" ? "first" : "last";
        if (isOpen) {
          const items = getEnabledItems(activeLayer(panelRef.current));
          focusElement(event.key === "ArrowDown" ? items[0] : items[items.length - 1]);
        } else setOpen(true);
      }
    },
  });

  const toRem = (px: number) => `${px / (position?.rootFontSize ?? 16)}rem`;
  const positionStyle: React.CSSProperties & Record<`--${string}`, string | undefined> = position
    ? {
        left: toRem(position.left),
        top: position.top !== undefined ? toRem(position.top) : undefined,
        bottom: position.bottom !== undefined ? toRem(position.bottom) : undefined,
        maxHeight: toRem(position.maxHeight),
        // iOS grow-in starts at the trigger's centre.
        "--menu-origin-x": ios ? toRem(position.originX) : undefined,
        "--menu-origin-y": ios
          ? position.top !== undefined
            ? toRem(position.originY)
            : `calc(100% - ${toRem(position.originY)})`
          : undefined,
      }
    : { left: 0, top: 0 }; // first commit only; the layout effect positions it before paint (no visibility:hidden — it would block initial focus)

  return (
    <>
      {triggerElement}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <MenuPanel
            ref={setPanelRef}
            id={panelId}
            aria-labelledby={triggerId}
            data-placement={position?.placement ?? "bottom"}
            data-align={align}
            className={buildClassName(classes.floating, className)}
            style={{ ...positionStyle, ...style }}
            onRequestClose={requestClose}
            platform={resolvedPlatform}
            variant={variant}
            {...panelProps}
          >
            {children}
          </MenuPanel>,
          document.body,
        )}
    </>
  );
};

export default Menu;
