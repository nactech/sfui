import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import classes from "./Menu.module.scss";
import { buildClassName } from "/@/core/util";
import MenuPanel, { type MenuPanelProps } from "./MenuPanel";
import type { MenuCloseReason } from "./context";
import { focusElement, getEnabledItems } from "./dom";
import { computeMenuPosition, type MenuAlign, type MenuPosition } from "./position";

/** Props `Menu` wires onto the trigger element. */
export interface MenuTriggerProps {
  ref?: React.Ref<HTMLElement>;
  id?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  "aria-haspopup"?: React.AriaAttributes["aria-haspopup"];
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
}

export interface MenuProps extends Omit<MenuPanelProps, "onRequestClose"> {
  /** The anchor, usually an icon button (•••). Gets `aria-haspopup="menu"`, `aria-expanded`, ref and handlers. */
  trigger: React.ReactElement<MenuTriggerProps>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which anchor edge the panel lines up with. Default `"end"` (final.pen: right edges aligned under •••). */
  align?: MenuAlign;
}

type FocusIntent = "first" | "last" | "panel";

interface PanelPosition extends MenuPosition {
  /** px → rem divisor (the document's root font size). */
  rootFontSize: number;
}

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
  align = "end",
  ref,
  className,
  style,
  children,
  ...panelProps
}: MenuProps) => {
  const generatedId = useId();
  const panelId = `${generatedId}-menu`;
  const triggerId = trigger.props.id ?? `${generatedId}-trigger`;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open !== undefined ? open : uncontrolledOpen;
  const [position, setPosition] = useState<PanelPosition | null>(null);

  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const focusIntentRef = useRef<FocusIntent>("panel");

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
    const next: PanelPosition = {
      rootFontSize,
      ...computeMenuPosition({
        anchor: anchor.getBoundingClientRect(),
        panelWidth: panel.offsetWidth,
        panelHeight: layer ? layer.offsetHeight + 2 : panel.offsetHeight, // + 1px rims
        viewportWidth: document.documentElement.clientWidth || window.innerWidth,
        viewportHeight: window.innerHeight,
        align,
        direction: getComputedStyle(anchor).direction === "rtl" ? "rtl" : "ltr",
      }),
    };
    setPosition((prev) =>
      prev &&
      prev.placement === next.placement &&
      prev.left === next.left &&
      prev.top === next.top &&
      prev.bottom === next.bottom &&
      prev.maxHeight === next.maxHeight &&
      prev.rootFontSize === next.rootFontSize
        ? prev
        : next,
    );
  }, [align]);

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

  const triggerElement = React.cloneElement(trigger, {
    ref: setTriggerRef,
    id: triggerId,
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? panelId : undefined,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      trigger.props.onClick?.(event);
      if (event.defaultPrevented) return;
      if (isOpen) {
        setOpen(false);
        return;
      }
      // `detail === 0`: Enter / Space on a native button.
      focusIntentRef.current = event.detail === 0 ? "first" : "panel";
      setOpen(true);
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
  const positionStyle: React.CSSProperties = position
    ? {
        left: toRem(position.left),
        top: position.top !== undefined ? toRem(position.top) : undefined,
        bottom: position.bottom !== undefined ? toRem(position.bottom) : undefined,
        maxHeight: toRem(position.maxHeight),
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
