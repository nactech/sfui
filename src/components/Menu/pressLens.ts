/** iOS press lens — final.pen M/A1 rows 2 / 2B: one highlight, never a full-width band. It fades in on
 *  touch-down (~100 ms) under the item, travels/morphs to whatever item is under the finger while sliding
 *  (list row → capsule inset 10 from the panel edges; medium row → rounded cell r 22), and releasing commits
 *  the item under the finger, like a native UIMenu. The lens is one element positioned imperatively (no
 *  re-render per pointer move). */

import { useCallback, useEffect, useMemo, useRef } from "react";
import { ITEM_SELECTOR } from "./dom";

/** The part of an item the lens covers (a list row's inner capsule); quick actions are covered whole. */
export const LENS_TARGET_SELECTOR = "[data-menu-lens]";

/** A native click that follows a pointer commit (same tap) is swallowed for this long. */
const CLICK_GUARD_MS = 800;

interface Press {
  pointerId: number;
  item: HTMLElement | null;
}

interface PressLensOptions {
  enabled: boolean;
  /** The active (visible) layer — only its enabled items can be highlighted. */
  getLayer: () => HTMLElement | null | undefined;
  /** Changes when the visible view changes, so the scrollability observer re-attaches. */
  viewKey: string;
}

export interface PressLensHandlers {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
  onClickCapture: (event: React.MouseEvent<HTMLElement>) => void;
}

const rootFontSize = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

export function usePressLens({ enabled, getLayer, viewKey }: PressLensOptions) {
  const lensRef = useRef<HTMLSpanElement | null>(null);
  const pressRef = useRef<Press | null>(null);
  const guardUntilRef = useRef(0);
  const ownClicksRef = useRef(new WeakSet<Event>());

  const itemAt = useCallback(
    (event: React.PointerEvent<HTMLElement>): HTMLElement | null => {
      const layer = getLayer();
      if (!layer) return null;
      // Touch pointers stay targeted at the element they went down on, so hit-test the finger position.
      // (jsdom has no elementFromPoint: fall back to the event target.)
      const hit =
        typeof document.elementFromPoint === "function"
          ? document.elementFromPoint(event.clientX, event.clientY)
          : (event.target as Element | null);
      const item = hit?.closest<HTMLElement>(ITEM_SELECTOR) ?? null;
      if (!item || !layer.contains(item) || item.getAttribute("aria-disabled") === "true") return null;
      return item;
    },
    [getLayer],
  );

  const hide = useCallback(() => {
    lensRef.current?.removeAttribute("data-visible");
  }, []);

  const place = useCallback((item: HTMLElement) => {
    const lens = lensRef.current;
    const viewport = lens?.parentElement;
    if (!lens || !viewport) return;
    const target = item.querySelector<HTMLElement>(LENS_TARGET_SELECTOR) ?? item;
    // Layout offsets, not client rects: they ignore the panel's grow-in scale and are already in the
    // scroll container's content coordinates, which is where the absolutely positioned lens lives.
    let x = 0;
    let y = 0;
    let el: HTMLElement | null = target;
    while (el && el !== viewport) {
      x += el.offsetLeft;
      y += el.offsetTop;
      el = el.offsetParent instanceof HTMLElement ? el.offsetParent : null;
    }
    if (el !== viewport) {
      // No offset chain to the viewport (e.g. jsdom): fall back to client rects.
      const r = target.getBoundingClientRect();
      const v = viewport.getBoundingClientRect();
      x = r.left - v.left + viewport.scrollLeft;
      y = r.top - v.top + viewport.scrollTop;
    }
    const fs = rootFontSize();
    const rem = (px: number) => `${px / fs}rem`;
    // Appearing: jump into place and only fade in; already visible: travel and morph.
    const appearing = !lens.hasAttribute("data-visible");
    if (appearing) lens.setAttribute("data-instant", "");
    lens.style.transform = `translate(${rem(x)}, ${rem(y)})`;
    lens.style.width = rem(target.offsetWidth);
    lens.style.height = rem(target.offsetHeight);
    lens.dataset.shape = item.hasAttribute("data-menu-quick") ? "cell" : "row";
    if (appearing) {
      void lens.offsetWidth; // commit the jump before transitions come back
      lens.removeAttribute("data-instant");
    }
    lens.setAttribute("data-visible", "");
  }, []);

  // A list taller than the screen must still scroll by touch: pan-y there (a drag then cancels the press).
  useEffect(() => {
    const viewport = lensRef.current?.parentElement;
    if (!enabled || !viewport || typeof ResizeObserver === "undefined") return;
    const update = () => viewport.toggleAttribute("data-scrollable", viewport.scrollHeight > viewport.clientHeight + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    viewport.querySelectorAll("[data-menu-layer]").forEach((layer) => observer.observe(layer));
    return () => observer.disconnect();
  }, [enabled, viewKey]);

  const handlers = useMemo<PressLensHandlers>(
    () => ({
      onPointerDown: (event) => {
        if (!enabled || (event.pointerType === "mouse" && event.button !== 0)) return;
        guardUntilRef.current = 0;
        const item = itemAt(event);
        pressRef.current = { pointerId: event.pointerId, item };
        if (item) place(item);
        // Keep receiving moves after the pointer leaves the start item (mouse; touch is captured anyway).
        try {
          event.currentTarget.setPointerCapture?.(event.pointerId);
        } catch {
          /* pointer already released */
        }
      },
      onPointerMove: (event) => {
        const press = pressRef.current;
        if (!press || press.pointerId !== event.pointerId) return;
        const item = itemAt(event);
        if (item === press.item) return;
        press.item = item;
        if (item) place(item);
        else hide();
      },
      onPointerUp: (event) => {
        const press = pressRef.current;
        if (!press || press.pointerId !== event.pointerId) return;
        pressRef.current = null;
        hide();
        const item = itemAt(event);
        if (!item) return;
        // Commit the item under the finger. The browser's own click for this tap (if any, and wherever it
        // lands) is swallowed so the item never fires twice.
        guardUntilRef.current = performance.now() + CLICK_GUARD_MS;
        const click = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          detail: 1,
          clientX: event.clientX,
          clientY: event.clientY,
        });
        ownClicksRef.current.add(click);
        item.dispatchEvent(click);
      },
      onPointerCancel: (event) => {
        if (pressRef.current?.pointerId !== event.pointerId) return;
        pressRef.current = null;
        hide();
      },
      onClickCapture: (event) => {
        if (!enabled) return;
        if (ownClicksRef.current.has(event.nativeEvent)) return;
        if (event.detail !== 0 && performance.now() < guardUntilRef.current) {
          guardUntilRef.current = 0;
          event.preventDefault();
          event.stopPropagation();
        }
      },
    }),
    [enabled, itemAt, place, hide],
  );

  return { lensRef, handlers };
}
