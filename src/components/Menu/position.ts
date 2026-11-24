/** Positioning helper for the floating menu panel: open below the anchor, flip above when it doesn't fit,
 *  shift horizontally to stay inside the viewport. All values are CSS px (client coordinates). */

export type MenuAlign = "start" | "end";
export type MenuPlacement = "bottom" | "top";

export interface AnchorRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface MenuPositionInput {
  anchor: AnchorRect;
  panelWidth: number;
  panelHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  align: MenuAlign;
  /** Text direction of the anchor — `start`/`end` follow it. */
  direction?: "ltr" | "rtl";
  /** Gap between anchor and panel. final.pen M/A2: anchor bottom 60 → panel top 66. */
  offset?: number;
  /** Minimum distance to the viewport edges. */
  padding?: number;
}

export interface MenuPosition {
  placement: MenuPlacement;
  left: number;
  /** Set when `placement` is `bottom`: the panel's top edge stays anchored. */
  top?: number;
  /** Set when `placement` is `top`: the panel's bottom edge stays anchored (height grows upwards). */
  bottom?: number;
  /** Space available on the chosen side. */
  maxHeight: number;
}

export const MENU_OFFSET = 6;
export const MENU_VIEWPORT_PADDING = 8;

export function computeMenuPosition({
  anchor,
  panelWidth,
  panelHeight,
  viewportWidth,
  viewportHeight,
  align,
  direction = "ltr",
  offset = MENU_OFFSET,
  padding = MENU_VIEWPORT_PADDING,
}: MenuPositionInput): MenuPosition {
  const spaceBelow = viewportHeight - anchor.bottom - offset - padding;
  const spaceAbove = anchor.top - offset - padding;
  const placement: MenuPlacement = spaceBelow >= panelHeight || spaceBelow >= spaceAbove ? "bottom" : "top";
  const maxHeight = Math.max(0, placement === "bottom" ? spaceBelow : spaceAbove);

  const alignRight = (align === "end") !== (direction === "rtl");
  const preferred = alignRight ? anchor.right - panelWidth : anchor.left;
  const maxLeft = viewportWidth - padding - panelWidth;
  const left = maxLeft < padding ? padding : Math.min(Math.max(preferred, padding), maxLeft);

  return placement === "bottom"
    ? { placement, left, top: anchor.bottom + offset, maxHeight }
    : { placement, left, bottom: viewportHeight - anchor.top + offset, maxHeight };
}
