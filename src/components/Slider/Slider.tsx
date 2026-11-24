import React from "react";
import classes from "./Slider.module.scss";
import { buildClassName } from "/@/core/util";
import { usePlatform } from "/@/core/platform";
import type { PlatformSetting } from "/@/core/platform";
import SliderIOSView from "./SliderIOS";

/** `m` = 44 (touch / default), `s` = 32 (dense web). Android + Web only — iOS has one size. */
export type SliderSize = "m" | "s";
/**
 * `glass` is only for a slider floating over content (photo, video).
 * Android + Web: the bar itself turns to glass. iOS: the slider sits in a glass panel (row "Over content").
 */
export type SliderVariant = "solid" | "glass";

/**
 * One component, two implementations (resolved with `usePlatform(platform)`):
 * - Android + Web (R/E1): the whole bar is the control, the fill is the handle, value text inside the fill.
 * - iOS (R/E2): thin native track, a glass lens that carries the value and grows while dragging,
 *   tick marks for `steps`, optional min / max icons.
 *
 * Platform-specific props (ignored on the other platform):
 * - Android + Web only: `size`, `icon`, `maxLabel`.
 * - iOS only: `leadingIcon`, `trailingIcon`.
 */
export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "children"> {
  ref?: React.Ref<HTMLDivElement>;
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. Defaults to `min` (or the first step). */
  defaultValue?: number;
  /** Fires on every change (drag, click, keyboard). */
  onValueChange?: (value: number) => void;
  /** Fires once the user lets go (pointer up) and on every keyboard change. */
  onValueCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Discrete stepped mode: the values drawn as connected segments with labels (e.g. `[12, 24, 30, 60]`). */
  steps?: readonly number[];
  size?: SliderSize;
  variant?: SliderVariant;
  disabled?: boolean;
  /** Accessible name (`aria-label`). The design has no visible label. */
  label?: string;
  /** Leading icon inside the fill (Lucide icon element). Android + Web only; on iOS use `leadingIcon`. */
  icon?: React.ReactNode;
  /** Value text drawn in the fill (Android + Web) or in the lens (iOS). Default: the number. Keep it short on iOS. */
  formatValue?: (value: number) => React.ReactNode;
  /** `aria-valuetext`. Defaults to `formatValue(value)` when it returns a string/number. */
  getValueText?: (value: number) => string;
  /** Draw the value text. Default `true`. */
  showValue?: boolean;
  /**
   * Trailing label in the empty part of the track. Default: `max`. `null` hides it. Continuous mode only.
   * Android + Web only (iOS has no max label: the lens carries the value).
   */
  maxLabel?: React.ReactNode;
  /** Segment label (Android + Web) / tick label (iOS) in stepped mode. Default: the step number. */
  formatStep?: (step: number) => React.ReactNode;
  /** Platform implementation. Omitted / `auto`: nearest `ConfigProvider`, else the user agent. */
  platform?: PlatformSetting;
  /** iOS only: decorative icon before the track (min end, e.g. Lucide `<Turtle />`). Ignored on Android + Web. */
  leadingIcon?: React.ReactNode;
  /** iOS only: decorative icon after the track (max end, e.g. Lucide `<Rabbit />`). Ignored on Android + Web. */
  trailingIcon?: React.ReactNode;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const decimalsOf = (n: number) => {
  const s = String(n);
  const i = s.indexOf(".");
  return i < 0 ? 0 : s.length - i - 1;
};

const snap = (v: number, min: number, max: number, step: number) => {
  if (!(step > 0)) return clamp(v, min, max);
  const snapped = min + Math.round((v - min) / step) * step;
  return clamp(Number(snapped.toFixed(Math.max(decimalsOf(step), decimalsOf(min)))), min, max);
};

const nearestIndex = (steps: readonly number[], v: number) => {
  let best = 0;
  for (let i = 1; i < steps.length; i++) {
    if (Math.abs(steps[i] - v) < Math.abs(steps[best] - v)) best = i;
  }
  return best;
};

const px = (value: string) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const Slider = ({
  ref,
  value: valueProp,
  defaultValue,
  onValueChange,
  onValueCommit,
  min: minProp = 0,
  max: maxProp = 100,
  step = 1,
  steps,
  size = "m",
  variant = "solid",
  disabled = false,
  label,
  icon,
  formatValue,
  getValueText,
  showValue = true,
  maxLabel,
  formatStep,
  platform: platformProp,
  leadingIcon,
  trailingIcon,
  className,
  style,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...rest
}: SliderProps) => {
  const platform = usePlatform(platformProp);
  const ios = platform === "ios";

  // Stepped mode works on the steps sorted ascending; the segments are drawn in that order.
  const stepList = steps && steps.length > 0 ? [...new Set(steps)].sort((a, b) => a - b) : null;
  const stepped = stepList !== null;
  const min = stepList ? stepList[0] : minProp;
  const max = stepList ? stepList[stepList.length - 1] : maxProp;

  const normalize = (v: number) => (stepList ? stepList[nearestIndex(stepList, v)] : snap(v, min, max, step));

  const [inner, setInner] = React.useState(() => normalize(defaultValue ?? min));
  const controlled = valueProp !== undefined;
  const value = normalize(controlled ? valueProp : inner);

  const [dragging, setDragging] = React.useState(false);
  const [labelOutside, setLabelOutside] = React.useState(false);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const fillRef = React.useRef<HTMLDivElement | null>(null);
  const valueRef = React.useRef<HTMLSpanElement | null>(null);
  // iOS: the track and the 56-wide lens wrap (its half is the inset the lens centre keeps from the ends).
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const lensWrapRef = React.useRef<HTMLDivElement | null>(null);
  const latest = React.useRef(value);
  latest.current = value;
  const grabOffset = React.useRef(0);

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") return ref(node);
    if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
  };

  const update = (next: number) => {
    const v = normalize(next);
    if (v === latest.current) return v;
    latest.current = v;
    if (!controlled) setInner(v);
    onValueChange?.(v);
    return v;
  };

  const span = max - min || 1;
  const pct = clamp((value - min) / span, 0, 1);
  const index = stepList ? stepList.indexOf(value) : -1;
  // iOS ticks are evenly spaced, so a stepped lens sits at index / (n - 1).
  const lensPct = stepList ? (stepList.length > 1 ? index / (stepList.length - 1) : 0) : pct;

  // ---- Geometry (continuous): fill width = minFill + (trackWidth - minFill) * pct ----
  const geometry = () => {
    const el = rootRef.current;
    const fill = fillRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const minFill = fill ? px(getComputedStyle(fill).minWidth) : 0;
    return { rect, minFill };
  };

  // ---- Geometry (iOS): lens centre = inset + (trackWidth - 2 * inset) * pct ----
  const iosGeometry = () => {
    const track = trackRef.current;
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    const inset = (lensWrapRef.current?.offsetWidth ?? 0) / 2;
    return { rect, inset, usable: rect.width - 2 * inset };
  };

  const valueFromX = (clientX: number) => {
    if (ios) {
      const g = iosGeometry();
      if (!g) return latest.current;
      const p = g.usable > 0 ? clamp((clientX - g.rect.left - g.inset) / g.usable, 0, 1) : 0;
      return stepList ? stepList[Math.round(p * (stepList.length - 1))] : min + p * span;
    }
    const g = geometry();
    if (!g) return latest.current;
    const { rect, minFill } = g;
    if (stepList) {
      const n = stepList.length;
      const i = clamp(Math.floor(((clientX - rect.left) / (rect.width || 1)) * n), 0, n - 1);
      return stepList[i];
    }
    const usable = rect.width - minFill;
    const p = usable > 0 ? (clientX - rect.left - minFill) / usable : 0;
    return min + clamp(p, 0, 1) * span;
  };

  // Low value: when the value text no longer fits inside the fill, it moves outside (row 6).
  React.useLayoutEffect(() => {
    if (ios || stepped || !showValue) return;
    const el = rootRef.current;
    const fill = fillRef.current;
    const text = valueRef.current;
    if (!el || !fill || !text) return;
    const measure = () => {
      const cs = getComputedStyle(fill);
      const minFill = px(cs.minWidth);
      const gap = px(cs.columnGap);
      const fillWidth = minFill + (el.clientWidth - minFill) * pct;
      setLabelOutside(fillWidth < minFill + gap + text.offsetWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ios, stepped, showValue, pct, value, size, icon]);

  // ---- Pointer: drag anywhere on the bar, click to jump, grabbing the grip does not jump ----
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(e);
    if (e.defaultPrevented || disabled || (e.pointerType === "mouse" && e.button !== 0)) return;
    // iOS: the min / max icons are decoration, like UISlider's value images — tapping them does nothing.
    if (ios && e.target instanceof Element && e.target.closest("[data-slider-icon]")) return;
    const el = e.currentTarget;
    e.preventDefault(); // no text selection; focus manually below
    el.focus({ preventScroll: true });
    try {
      el.setPointerCapture?.(e.pointerId);
    } catch {
      // Synthetic / already-released pointer: dragging still works while over the element.
    }
    grabOffset.current = 0;
    if (ios) {
      // Grabbing the lens does not jump; anywhere else on the track jumps there.
      const g = iosGeometry();
      if (g) {
        const centre = g.rect.left + g.inset + g.usable * lensPct;
        if (Math.abs(e.clientX - centre) <= g.inset) grabOffset.current = centre - e.clientX;
      }
    }
    const g = ios ? null : geometry();
    if (g && !stepped) {
      const edge = g.rect.left + g.minFill + (g.rect.width - g.minFill) * pct;
      const zone = g.rect.height / 2;
      if (Math.abs(e.clientX - edge) <= zone) grabOffset.current = edge - e.clientX;
    }
    setDragging(true);
    update(valueFromX(e.clientX + grabOffset.current));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    if (!dragging || disabled) return;
    update(valueFromX(e.clientX + grabOffset.current));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    onValueCommit?.(latest.current);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerUp?.(e);
    endDrag(e);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerCancel?.(e);
    endDrag(e);
  };

  // ---- Keyboard: arrows, PageUp/PageDown, Home/End ----
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    let next: number | undefined;
    if (stepList) {
      const last = stepList.length - 1;
      const move = (d: number) => stepList[clamp(index + d, 0, last)];
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
        case "PageUp":
          next = move(1);
          break;
        case "ArrowLeft":
        case "ArrowDown":
        case "PageDown":
          next = move(-1);
          break;
        case "Home":
          next = stepList[0];
          break;
        case "End":
          next = stepList[last];
          break;
      }
    } else {
      const big = Math.max(step, snap(span / 10, 0, span, step));
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = value + step;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = value - step;
          break;
        case "PageUp":
          next = value + big;
          break;
        case "PageDown":
          next = value - big;
          break;
        case "Home":
          next = min;
          break;
        case "End":
          next = max;
          break;
      }
    }
    if (next === undefined) return;
    e.preventDefault();
    const before = latest.current;
    const v = update(next);
    if (v !== before) onValueCommit?.(v);
  };

  const formatted = formatValue ? formatValue(value) : value;
  const valueText =
    getValueText?.(value) ??
    (typeof formatted === "string" || typeof formatted === "number" ? String(formatted) : undefined);

  const shared = {
    ...rest,
    ref: setRefs,
    role: "slider",
    tabIndex: disabled ? undefined : 0,
    "aria-label": label ?? rest["aria-label"],
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value,
    "aria-valuetext": valueText,
    "aria-orientation": "horizontal" as const,
    "aria-disabled": disabled || undefined,
    "data-platform": platform,
    "data-size": ios ? undefined : size,
    "data-variant": variant,
    "data-dragging": dragging || undefined,
    onKeyDown: handleKeyDown,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  };

  if (ios) {
    return (
      <SliderIOSView
        rootProps={shared}
        className={className}
        style={style}
        pct={lensPct}
        trackRef={trackRef}
        lensWrapRef={lensWrapRef}
        steps={stepList}
        index={index}
        formatStep={formatStep}
        showValue={showValue}
        formatted={formatted}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
      />
    );
  }

  if (stepList) {
    return (
      <div {...shared} className={buildClassName(classes.stepped, className)} style={style}>
        {stepList.map((s, i) => (
          <div
            key={s}
            className={classes.segment}
            data-active={i <= index || undefined}
            data-current={i === index || undefined}
          >
            {i === index && <span className={classes.dot} aria-hidden />}
            <span className={classes.stepLabel}>{formatStep ? formatStep(s) : s}</span>
          </div>
        ))}
      </div>
    );
  }

  const trailing = maxLabel === undefined ? max : maxLabel;

  return (
    <div
      {...shared}
      className={buildClassName(classes.slider, className)}
      data-icon={icon ? "" : undefined}
      data-label-outside={(showValue && labelOutside) || undefined}
      style={{ ...style, ["--_pct" as string]: pct }}
    >
      {trailing !== null && trailing !== false && (
        <span className={classes.max} aria-hidden>
          {trailing}
        </span>
      )}
      <div ref={fillRef} className={classes.fill} aria-hidden>
        {icon && <span className={classes.icon}>{icon}</span>}
        <span className={classes.grip} />
      </div>
      {showValue && (
        <span ref={valueRef} className={classes.value} aria-hidden>
          {formatted}
        </span>
      )}
    </div>
  );
};

export default Slider;
