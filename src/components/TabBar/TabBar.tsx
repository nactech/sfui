import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import webClasses from "./TabBar.module.scss";
import iosClasses from "./TabBar.ios.module.scss";
import { buildClassName } from "/@/core/util";
import { usePlatform, type PlatformSetting } from "/@/core/platform";
import { IOS_LENS_MOTION, PillMotion, TAB_BAR_MOTION, type PillFrame } from "./pillMotion";
import { SearchFieldIOS, type TabBarSearch } from "./TabBarIOS";

export type { TabBarSearch } from "./TabBarIOS";

export type TabBarPlacement = "auto" | "bottom" | "top";
export type TabBarAlign = "center" | "start";
export type TabBarLayout = "auto" | "compact" | "wide";

export interface TabBarItem {
  value: string;
  label: string;
  /** Lucide icon (or any ReactNode). Sized by the bar: 22 compact and iOS, 18 wide. */
  icon: React.ReactNode;
  /** `number` shows a count (0 hides it, > 99 shows "99+"); `true` shows a dot. */
  badge?: number | boolean;
  /** Screen-reader text for the badge, e.g. "3 new exports". Defaults to the count. */
  badgeLabel?: string;
  /** When any item has `href` the bar renders links in a `<nav>` with `aria-current="page"`. */
  href?: string;
  disabled?: boolean;
}

export interface TabBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "children" | "aria-label" | "aria-labelledby"> {
  ref?: React.Ref<HTMLDivElement>;
  items: TabBarItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * `auto` (default): floating at the bottom below 600 px, sticky at the top (wide layout) from 600 px.
   * `bottom`: always floating at the bottom (labels beside icons from 600 px). `top`: always the top navigation.
   * Ignored on iOS: the iOS tab bar always floats at the bottom.
   */
  placement?: TabBarPlacement;
  /**
   * `auto` (default): compact (pill + label under, `Tab Bar/Android+Web`) below 600 px, wide (labels beside
   * icons, `Tab Bar/Web Top`) from 600 px; the top placement is always wide. `compact` / `wide` force one.
   * Ignored on iOS.
   */
  layout?: TabBarLayout;
  /** Top placement only (Android / Web): centre the capsule (N/A4 row 1) or put it after `leading` (row 2). */
  align?: TabBarAlign;
  /**
   * Pin to the viewport (bottom: `position: fixed`, top: `position: sticky`). `false` renders the bar in flow,
   * e.g. inside a preview or a custom shell. On iOS the pinned bar sits above the home indicator
   * (`env(safe-area-inset-bottom)`).
   */
  pinned?: boolean;
  /** Top placement only: content before the capsule (logo). Never inside the capsule; hidden at the bottom and on iOS. */
  leading?: React.ReactNode;
  /** Top placement only: content after the capsule (search, account). Hidden at the bottom and on iOS. */
  trailing?: React.ReactNode;
  /**
   * Which implementation renders: `ios` (floating Liquid-Glass bar with a lens, N/A1) or `android` / `web`
   * (tonal pill, N/A2 / N/A4). Default: the nearest `ConfigProvider platform`, else the user agent.
   */
  platform?: PlatformSetting;
  /**
   * iOS only (N/A1 row 4, `Tab Bar/iOS Minimized`): collapse the bar to a circle with the selected tab's icon.
   * `"auto"` minimizes when the page scrolls down and restores on scroll up / at the top. Tapping the circle
   * restores the bar. Default `false`. Ignored on Android / Web.
   */
  minimized?: boolean | "auto";
  /** iOS only: the bar minimized (`true`) or restored (`false`) by scrolling (`"auto"`) or by tapping the circle. */
  onMinimizedChange?: (minimized: boolean) => void;
  /**
   * iOS only, with `minimized="auto"`: the element whose scrolling minimizes the bar. `undefined` (default) = the
   * window; `null` = not mounted yet (nothing is observed until it is).
   */
  scrollContainer?: HTMLElement | null;
  /**
   * iOS only (`Tab Bar/iOS` → Search, N/A1 row 5): a separate search circle beside the bar that expands into a
   * search field (the bar hides meanwhile). Ignored on Android / Web — put search in `trailing` there.
   */
  search?: TabBarSearch;
  /** Accessible name of the tablist / navigation landmark. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

interface Gesture {
  id: number;
  x0: number;
  press: number;
  dragging: boolean;
  cancelled: boolean;
  touch: boolean;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** `minimized="auto"`: scroll distance (px) in one direction before the bar minimizes / restores. */
const SCROLL_SLOP = 8;

const rootFontPx = () => {
  if (typeof window === "undefined") return 16;
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
};

function badgeText(badge: number | boolean | undefined) {
  if (typeof badge !== "number" || badge <= 0) return null;
  return badge > 99 ? "99+" : String(badge);
}

const TabBar = ({
  ref,
  items,
  value,
  defaultValue,
  onValueChange,
  placement = "auto",
  layout = "auto",
  align = "center",
  pinned = true,
  leading,
  trailing,
  platform,
  minimized = false,
  onMinimizedChange,
  scrollContainer,
  search,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  style,
  ...rest
}: TabBarProps) => {
  const resolvedPlatform = usePlatform(platform);
  const ios = resolvedPlatform === "ios";
  const classes = ios ? iosClasses : webClasses;

  const controlled = value !== undefined;
  const [inner, setInner] = useState<string | undefined>(
    () => defaultValue ?? items.find((i) => !i.disabled)?.value,
  );
  const selectedValue = controlled ? value : inner;
  const selectedIdx = items.findIndex((i) => i.value === selectedValue);
  const linkMode = items.some((i) => i.href !== undefined);

  // Visually active tab (pill + tint). Follows the pill during travel / drag; equals the selection at rest.
  const [indicated, setIndicated] = useState(selectedIdx);
  const [pressedIdx, setPressedIdx] = useState(-1);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const [, forceRender] = useState(0);

  const barRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const indicatorRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const remPx = useRef(16);

  // Latest props for event handlers and the motion host (avoids re-binding listeners every render).
  const latest = useRef({ items, selectedIdx });
  latest.current = { items, selectedIdx };

  const motionRef = useRef<PillMotion | null>(null);
  if (!motionRef.current) {
    motionRef.current = new PillMotion({
      count: () => latest.current.items.length,
      isEnabled: (i) => !latest.current.items[i]?.disabled,
      measure: (i) => {
        const bar = barRef.current;
        const el = indicatorRefs.current[i];
        if (!bar || !el) return null;
        const b = bar.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return null;
        // Undo a transform on the bar (iOS minimize morph) so the pill is laid out in the bar's own px.
        // (offsetWidth is rounded to whole px, so ratios within 1 % of 1 are rounding, not a transform.)
        const ratio = bar.offsetWidth > 0 && b.width > 0 ? b.width / bar.offsetWidth : 1;
        const s = Math.abs(ratio - 1) < 0.01 ? 1 : ratio;
        return {
          x: (r.left - b.left) / s - bar.clientLeft,
          y: (r.top - b.top) / s - bar.clientTop,
          w: r.width / s,
          h: r.height / s,
        };
      },
      render: (f: PillFrame) => {
        const pill = pillRef.current;
        if (!pill) return;
        const rem = (px: number) => `${px / remPx.current}rem`;
        pill.style.setProperty("--_pill-x", rem(f.x));
        pill.style.setProperty("--_pill-y", rem(f.y));
        pill.style.setProperty("--_pill-w", rem(f.w));
        pill.style.setProperty("--_pill-h", rem(f.h));
        pill.style.setProperty("--_pill-o", String(f.opacity));
        pill.style.setProperty("--_pill-lift", String(Math.round(f.lift * 1000) / 1000));
      },
      indicate: (i) => {
        setIndicated(i);
        // SEGMENT_TICK on each tab crossed while dragging (Android web; no-op elsewhere).
        const g = gesture.current;
        if (g?.dragging && g.touch && typeof navigator !== "undefined") navigator.vibrate?.(8);
      },
      reducedMotion: () => typeof window !== "undefined" && !!window.matchMedia?.(REDUCED_MOTION).matches,
      scale: () => remPx.current / 16,
    });
  }
  const motion = motionRef.current;
  // Same timing rules on every platform; iOS uses its own springs and a lens that scales 1.15× (N/A3 SPEC).
  motion.config = ios ? IOS_LENS_MOTION : TAB_BAR_MOTION;

  // Mount: place the pill without animation; keep it measured on resize / layout switch (600 px) / font load.
  useLayoutEffect(() => {
    remPx.current = rootFontPx();
    motion.jumpTo(latest.current.selectedIdx);
    const bar = barRef.current;
    if (!bar || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      remPx.current = rootFontPx();
      motion.refresh();
    });
    ro.observe(bar);
    itemRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [motion, items.length, linkMode, placement, layout, ios]);

  // Selection changed (tap, keyboard, drag release, or the parent): travel there. Also reconciles a
  // controlled parent that rejected a drag commit — the pill goes back to the committed tab.
  useLayoutEffect(() => {
    motion.sync(selectedIdx);
  });

  useEffect(() => () => motion.destroy(), [motion]);

  const commit = useCallback(
    (i: number) => {
      const item = latest.current.items[i];
      if (!item || item.disabled) return;
      if (i !== latest.current.selectedIdx) {
        if (!controlled) setInner(item.value);
        onValueChange?.(item.value);
      }
      forceRender((n) => n + 1);
    },
    [controlled, onValueChange],
  );

  const onItemClick = (e: React.MouseEvent<HTMLElement>, i: number) => {
    if (suppressClick.current || items[i].disabled) {
      suppressClick.current = false;
      e.preventDefault();
      return;
    }
    commit(i);
  };

  // ── Press, hold & drag (N/A3 "Hold & drag · opens only on release") ──────

  const endGesture = useRef<() => void>(() => {});

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || !e.isPrimary) return;
    const bar = barRef.current;
    if (!bar) return;
    suppressClick.current = false;
    const itemEl = (e.target as Element).closest<HTMLElement>("[data-index]");
    const idx = itemEl && bar.contains(itemEl) ? Number(itemEl.dataset.index) : -1;
    if (idx >= 0 && items[idx].disabled) return;

    endGesture.current();
    gesture.current = { id: e.pointerId, x0: e.clientX, press: idx, dragging: false, cancelled: false, touch: e.pointerType === "touch" };
    if (idx >= 0 && idx === selectedIdx) motion.setHold(true);
    else if (idx >= 0) setPressedIdx(idx);

    const toBar = (clientX: number) => clientX - bar.getBoundingClientRect().left - bar.clientLeft;

    const move = (ev: PointerEvent) => {
      const g = gesture.current;
      if (!g || ev.pointerId !== g.id || g.cancelled) return;
      if (!g.dragging) {
        if (Math.abs(ev.clientX - g.x0) < TAB_BAR_MOTION.dragSlop) return;
        g.dragging = true;
        setPressedIdx(-1);
        motion.startDrag(toBar(ev.clientX));
      }
      const b = bar.getBoundingClientRect();
      const outside = Math.max(b.left - ev.clientX, ev.clientX - b.right, b.top - ev.clientY, ev.clientY - b.bottom);
      if (outside > TAB_BAR_MOTION.cancelDistance) {
        // Finger left the bar by > 40 px: back to origin, nothing is committed.
        g.cancelled = true;
        motion.cancelDrag(latest.current.selectedIdx);
        return;
      }
      motion.dragTo(toBar(ev.clientX));
    };

    const up = (ev: PointerEvent) => {
      const g = gesture.current;
      if (!g || ev.pointerId !== g.id) return;
      cleanup();
      setPressedIdx(-1);
      if (g.cancelled) {
        suppressClick.current = true;
        return;
      }
      if (!g.dragging) {
        // A tap: the native click on the item commits (keeps links, modifiers and keyboard parity).
        motion.setHold(false);
        return;
      }
      // Release: snap to the nearest centre, then commit that tab.
      const target = motion.nearest(true);
      motion.endDrag(target >= 0 ? target : latest.current.selectedIdx);
      if (target >= 0) {
        const el = itemRefs.current[target];
        if (latest.current.items[target].href !== undefined && el) el.click();
        else commit(target);
      }
      // Swallow the click the browser may still fire on the pressed item.
      suppressClick.current = true;
    };

    const cancel = (ev: PointerEvent) => {
      const g = gesture.current;
      if (!g || ev.pointerId !== g.id) return;
      cleanup();
      setPressedIdx(-1);
      if (g.dragging && !g.cancelled) motion.cancelDrag(latest.current.selectedIdx);
      else motion.setHold(false);
    };

    const cleanup = () => {
      gesture.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      endGesture.current = () => {};
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    endGesture.current = cleanup;
  };

  useEffect(() => () => endGesture.current(), []);

  // ── Keyboard: ← → move focus, Home / End, Enter / Space commits (pill moves on commit) ──

  const enabled = (i: number) => !items[i]?.disabled;
  const firstEnabled = items.findIndex((i) => !i.disabled);

  const step = (from: number, dir: 1 | -1) => {
    const n = items.length;
    for (let k = 1; k <= n; k++) {
      const i = (((from + dir * k) % n) + n) % n;
      if (enabled(i)) return i;
    }
    return from;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    suppressClick.current = false;
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (current < 0) return;
    const rtl = barRef.current ? getComputedStyle(barRef.current).direction === "rtl" : false;
    let next: number;
    switch (e.key) {
      case "ArrowRight":
        next = step(current, rtl ? -1 : 1);
        break;
      case "ArrowLeft":
        next = step(current, rtl ? 1 : -1);
        break;
      case "Home":
        next = firstEnabled;
        break;
      case "End":
        next = step(items.length, -1);
        break;
      default:
        return;
    }
    if (next < 0) return;
    e.preventDefault();
    setFocusIdx(next);
    itemRefs.current[next]?.focus();
  };

  const onBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!barRef.current?.contains(e.relatedTarget as Node | null)) setFocusIdx(null);
  };

  // Roving tabindex (tabs only): the focused tab, else the selected one, else the first enabled.
  const rovingIdx = focusIdx ?? (selectedIdx >= 0 && enabled(selectedIdx) ? selectedIdx : firstEnabled);

  // ── iOS: minimize on scroll (N/A1 row 4) and the search tab (row 5). Inert on Android / Web. ──

  const [autoMinimized, setAutoMinimized] = useState(false);
  const searchControlled = search?.expanded !== undefined;
  const [searchInner, setSearchInner] = useState(!!search?.defaultExpanded);
  const searchExpanded = ios && !!search && (searchControlled ? !!search.expanded : searchInner);
  // "collapsed" once the field has closed, so the bar grows back in — but does not animate on first paint.
  const [searchClosed, setSearchClosed] = useState(false);
  const isMinimized = ios && !searchExpanded && (minimized === true || (minimized === "auto" && autoMinimized));

  const miniRef = useRef<HTMLButtonElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  /** Where focus goes after a morph removes the focused control (keyboard users). */
  const restoreFocus = useRef<"mini" | "tab" | "search" | null>(null);
  const focusField = useRef(false);

  const latestIOS = useRef({ onMinimizedChange, autoMinimized });
  latestIOS.current = { onMinimizedChange, autoMinimized };

  const setAuto = useCallback((next: boolean) => {
    const l = latestIOS.current;
    if (l.autoMinimized === next) return;
    l.autoMinimized = next;
    if (next && barRef.current?.contains(document.activeElement)) restoreFocus.current = "mini";
    setAutoMinimized(next);
    l.onMinimizedChange?.(next);
  }, []);

  useEffect(() => {
    if (!ios || minimized !== "auto" || scrollContainer === null) return;
    const target: HTMLElement | Window = scrollContainer ?? window;
    const read = () => {
      if (scrollContainer) {
        return { y: scrollContainer.scrollTop, max: scrollContainer.scrollHeight - scrollContainer.clientHeight };
      }
      const doc = document.scrollingElement ?? document.documentElement;
      return { y: window.scrollY, max: doc.scrollHeight - window.innerHeight };
    };
    let anchor = read().y;
    const onScroll = () => {
      const { y, max } = read();
      if (y <= 0) {
        // Back at the top (or rubber-banding above it): full bar.
        anchor = 0;
        setAuto(false);
        return;
      }
      if (max > 0 && y > max) return; // rubber-banding past the end is not a scroll up
      const dy = y - anchor;
      if (Math.abs(dy) < SCROLL_SLOP) return;
      anchor = y;
      setAuto(dy > 0);
    };
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [ios, minimized, scrollContainer, setAuto]);

  const onMiniClick = () => {
    if (document.activeElement === miniRef.current) restoreFocus.current = "tab";
    if (minimized === "auto") setAuto(false);
    else onMinimizedChange?.(false);
  };

  const setSearchExpanded = (next: boolean) => {
    if (!searchControlled) setSearchInner(next);
    search?.onExpandedChange?.(next);
  };

  const onSearchClick = () => {
    search?.onActivate?.();
    focusField.current = true;
    setSearchExpanded(true);
  };

  const onSearchClose = () => {
    restoreFocus.current = "search";
    focusField.current = false;
    setSearchClosed(true);
    setSearchExpanded(false);
  };

  // Keep keyboard focus on a visible control when the bar morphs.
  useLayoutEffect(() => {
    const target = restoreFocus.current;
    if (!target) return;
    if (target === "mini" && isMinimized) miniRef.current?.focus();
    else if (target === "tab" && !isMinimized) itemRefs.current[rovingIdx]?.focus();
    else if (target === "search" && !searchExpanded) searchButtonRef.current?.focus();
    else return;
    restoreFocus.current = null;
  }, [isMinimized, searchExpanded, rovingIdx]);

  const renderItem = (item: TabBarItem, i: number) => {
    const selected = i === selectedIdx;
    const count = badgeText(item.badge);
    const showBadge = count !== null || item.badge === true;
    const srBadge = item.badgeLabel ?? count;

    const content = (
      <>
        <span className={classes.icon}>
          <span
            className={classes.indicator}
            ref={(el) => {
              indicatorRefs.current[i] = el;
            }}
          />
          <span className={classes.glyph} aria-hidden="true">
            {item.icon}
            {showBadge && (
              <span className={buildClassName(classes.badge, count === null && classes.badgeDot)} data-badge={count === null ? "dot" : "count"}>
                {count}
              </span>
            )}
          </span>
        </span>
        <span className={classes.label}>{item.label}</span>
      </>
    );

    const common = {
      className: classes.item,
      "data-index": i,
      "data-highlighted": i === indicated ? "" : undefined,
      "data-pressed": i === pressedIdx ? "" : undefined,
      "data-disabled": item.disabled ? "" : undefined,
      // The badge is decorative (aria-hidden); its meaning is folded into the name, e.g. "Export (3)".
      "aria-label": showBadge && srBadge ? `${item.label} (${srBadge})` : undefined,
      onClick: (e: React.MouseEvent<HTMLElement>) => onItemClick(e, i),
      onFocus: () => setFocusIdx(i),
    };
    const setRef = (el: HTMLElement | null) => {
      itemRefs.current[i] = el;
    };

    if (item.href !== undefined) {
      return (
        <a
          key={item.value}
          ref={setRef}
          {...common}
          href={item.disabled ? undefined : item.href}
          role={item.disabled ? "link" : undefined}
          aria-current={selected ? "page" : undefined}
          aria-disabled={item.disabled || undefined}
          tabIndex={item.disabled ? -1 : undefined}
          draggable={false}
        >
          {content}
        </a>
      );
    }
    return (
      <button
        key={item.value}
        ref={setRef}
        type="button"
        {...common}
        role={linkMode ? undefined : "tab"}
        aria-selected={linkMode ? undefined : selected}
        tabIndex={linkMode ? undefined : i === rovingIdx ? 0 : -1}
        disabled={item.disabled}
      >
        {content}
      </button>
    );
  };

  // On iOS the bar is hidden (and inert) while minimized or while search is open.
  const barHidden = isMinimized || searchExpanded;
  const barProps = {
    ref: (el: HTMLElement | null) => {
      barRef.current = el;
    },
    className: classes.bar,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    inert: barHidden || undefined,
    onPointerDown,
    onKeyDown,
    onBlur,
  };
  const barContent = (
    <>
      <span ref={pillRef} className={classes.pill} aria-hidden="true" data-pill="" />
      {items.map(renderItem)}
    </>
  );
  const bar = linkMode ? (
    <nav {...barProps}>{barContent}</nav>
  ) : (
    <div {...barProps} role="tablist" aria-orientation="horizontal">
      {barContent}
    </div>
  );

  if (ios) {
    const selectedItem = selectedIdx >= 0 ? items[selectedIdx] : undefined;
    return (
      <div
        ref={ref}
        className={buildClassName(classes.root, className)}
        data-platform="ios"
        data-placement="bottom"
        data-pinned={pinned ? undefined : "false"}
        data-minimized={isMinimized ? "" : undefined}
        data-search={searchExpanded ? "expanded" : searchClosed ? "collapsed" : undefined}
        style={{ ...style, "--_count": items.length } as React.CSSProperties}
        {...rest}
      >
        <div className={classes.tabs}>
          {bar}
          {/* N/A1 row 4: the minimized bar is a circle with the selected tab's icon; tap restores the bar. */}
          <button
            ref={miniRef}
            type="button"
            className={classes.mini}
            aria-label={selectedItem?.label ?? ariaLabel ?? "Tabs"}
            aria-expanded={false}
            inert={!isMinimized || undefined}
            aria-hidden={!isMinimized || undefined}
            data-mini=""
            onClick={onMiniClick}
          >
            <span className={classes.miniIcon} aria-hidden="true">
              {selectedItem?.icon}
            </span>
          </button>
        </div>
        {search && !searchExpanded && (
          <button
            ref={searchButtonRef}
            type="button"
            className={classes.searchButton}
            aria-label={search.label ?? "Search"}
            aria-expanded={false}
            onClick={onSearchClick}
          >
            <Search aria-hidden="true" />
          </button>
        )}
        {search && searchExpanded && <SearchFieldIOS search={search} onClose={onSearchClose} autoFocus={focusField.current} />}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={buildClassName(classes.root, className)}
      data-platform={resolvedPlatform}
      data-placement={placement}
      data-layout={layout}
      data-align={align}
      data-pinned={pinned ? undefined : "false"}
      style={style}
      {...rest}
    >
      {leading !== undefined && <div className={classes.leading}>{leading}</div>}
      {bar}
      {trailing !== undefined && <div className={classes.trailing}>{trailing}</div>}
    </div>
  );
};

export default TabBar;
