import React, { useCallback, useRef, useState } from "react";

/** Design px (L/A5, L/B5, L/C5): 56 capsules, 6 between them, 6 from the edge, 4 between the row and the first one. */
const CAPSULE = 56;
const CAPSULE_GAP = 6;
const EDGE = 6;
const ROW_GAP = 4;
/** Movement (px) before a gesture is classified as horizontal swipe or vertical scroll. */
const SLOP = 8;
/** Release velocity (px/ms) that decides the snap regardless of position. */
const FLICK = 0.4;
/** Resistance past the fully revealed position. */
const OVERSHOOT = 0.3;

/** Revealed width in design px for `count` capsules (2 → 128, as drawn). */
export const swipeRevealPx = (count: number) =>
  count > 0 ? count * CAPSULE + (count - 1) * CAPSULE_GAP + EDGE + ROW_GAP : 0;

const rootFontPx = () => {
  if (typeof window === "undefined") return 16;
  return parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
};

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  base: number;
  active: boolean;
  lastX: number;
  lastT: number;
  velocity: number;
  offset: number;
}

export interface SwipeReveal {
  /** Current revealed distance as a rem string (drives `--_offset`). */
  offset: string;
  dragging: boolean;
  handlers: {
    onPointerDown: React.PointerEventHandler<HTMLElement>;
    onPointerMove: React.PointerEventHandler<HTMLElement>;
    onPointerUp: React.PointerEventHandler<HTMLElement>;
    onPointerCancel: React.PointerEventHandler<HTMLElement>;
    onClickCapture: React.MouseEventHandler<HTMLElement>;
  };
}

/**
 * Swipe-left reveal with pointer events (touch, pen and mouse drag). Snaps open past half the reveal width or on a
 * leftward flick, closed otherwise. The open state itself is owned by the caller (one open row per list).
 */
export function useSwipeReveal({
  enabled,
  count,
  open,
  setOpen,
}: {
  enabled: boolean;
  count: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}): SwipeReveal {
  const revealDesignPx = swipeRevealPx(count);
  const drag = useRef<DragState | null>(null);
  const suppressClick = useRef(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const finish = useCallback(
    (commit: boolean, timeStamp: number) => {
      const d = drag.current;
      drag.current = null;
      if (!d?.active) return;
      if (commit) {
        suppressClick.current = true;
        const reveal = revealDesignPx * (rootFontPx() / 16);
        // A pause before release cancels the flick.
        const velocity = timeStamp - d.lastT > 100 ? 0 : d.velocity;
        const next = velocity < -FLICK ? true : velocity > FLICK ? false : d.offset > reveal / 2;
        setOpen(next);
      }
      setDragOffset(null);
    },
    [revealDesignPx, setOpen],
  );

  const onPointerDown: React.PointerEventHandler<HTMLElement> = (event) => {
    suppressClick.current = false;
    if (!enabled || (event.pointerType === "mouse" && event.button !== 0)) return;
    const reveal = revealDesignPx * (rootFontPx() / 16);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      base: open ? reveal : 0,
      active: false,
      lastX: event.clientX,
      lastT: event.timeStamp,
      velocity: 0,
      offset: open ? reveal : 0,
    };
  };

  const onPointerMove: React.PointerEventHandler<HTMLElement> = (event) => {
    const d = drag.current;
    if (!d || d.pointerId !== event.pointerId || !enabled) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    if (!d.active) {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        drag.current = null; // vertical: let the page scroll
        return;
      }
      d.active = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    const reveal = revealDesignPx * (rootFontPx() / 16);
    let offset = Math.max(0, d.base - dx);
    if (offset > reveal) offset = reveal + (offset - reveal) * OVERSHOOT;
    const dt = event.timeStamp - d.lastT;
    // Sample velocity over ≥ 4ms windows (coalesced events arrive almost together).
    if (dt >= 4) {
      d.velocity = (event.clientX - d.lastX) / dt;
      d.lastX = event.clientX;
      d.lastT = event.timeStamp;
    }
    d.offset = offset;
    setDragOffset(offset);
  };

  const onPointerUp: React.PointerEventHandler<HTMLElement> = (event) => {
    if (drag.current?.pointerId === event.pointerId) finish(true, event.timeStamp);
  };

  const onPointerCancel: React.PointerEventHandler<HTMLElement> = (event) => {
    if (drag.current?.pointerId === event.pointerId) finish(false, event.timeStamp);
  };

  const onClickCapture: React.MouseEventHandler<HTMLElement> = (event) => {
    // The click that ends a drag never activates the row.
    if (suppressClick.current) {
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    // A tap (not a keyboard click, detail 0) on an open row closes it instead of activating it.
    if (open && event.detail > 0) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  };

  const dragging = enabled && dragOffset != null;
  const offsetRem = dragging ? dragOffset / rootFontPx() : enabled && open ? revealDesignPx / 16 : 0;

  return {
    offset: `${offsetRem}rem`,
    dragging,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture },
  };
}
