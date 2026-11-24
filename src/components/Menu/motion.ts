/** Submenu transition — final.pen M/A2 row 4B "shared axis X + height spring".
 *  Out: 0 → −35% W, opacity 1 → 0 over 0–30%. In: +35% W → 0, opacity 0 → 1 over 30–70%.
 *  Height: spring stiffness 700, damping ratio 1.0 (CSS fallback 320 ms cubic-bezier(0.2, 0, 0, 1)).
 *  Reduced motion: 150 ms crossfade, height snaps. */

export type MenuNavDirection = "forward" | "back";

const STIFFNESS = 700;
/** Critically damped (ratio 1.0) settles within 0.1% after ωt ≈ 9.2 → ~340 ms (matches the 4B keyframe labels). */
const SPRING_DURATION = 340;
const FALLBACK_DURATION = 320;
const FALLBACK_EASING = "cubic-bezier(0.2, 0, 0, 1)";
const REDUCED_DURATION = 150;
const SHIFT = 35;

let springCache: { easing: string; duration: number } | null = null;

function springTiming() {
  if (springCache) return springCache;
  const supportsLinear = typeof CSS !== "undefined" && CSS.supports?.("animation-timing-function", "linear(0, 1)");
  if (!supportsLinear) {
    springCache = { easing: FALLBACK_EASING, duration: FALLBACK_DURATION };
    return springCache;
  }
  const omega = Math.sqrt(STIFFNESS); // mass 1
  const steps = 24;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (SPRING_DURATION / 1000);
    const x = i === steps ? 1 : 1 - (1 + omega * t) * Math.exp(-omega * t);
    points.push(String(Math.round(x * 10000) / 10000));
  }
  springCache = { easing: `linear(${points.join(", ")})`, duration: SPRING_DURATION };
  return springCache;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function canAnimate(el: Element | null | undefined): el is HTMLElement {
  return !!el && typeof (el as HTMLElement).animate === "function";
}

interface ViewTransitionInput {
  panel: HTMLElement;
  from: HTMLElement;
  to: HTMLElement;
  /** Panel height (px) measured before the switch. */
  fromHeight: number;
  direction: MenuNavDirection;
  rootFontSize: number;
}

/** Runs the in-place submenu transition. The outgoing layer must already be out of flow
 *  (absolute), so the panel's current height is the incoming content height. */
export function runViewTransition({ panel, from, to, fromHeight, direction, rootFontSize }: ViewTransitionInput): Animation[] {
  if (prefersReducedMotion()) {
    const timing: KeyframeAnimationOptions = { duration: REDUCED_DURATION, easing: "linear", fill: "both" };
    return [from.animate([{ opacity: 1 }, { opacity: 0 }], timing), to.animate([{ opacity: 0 }, { opacity: 1 }], timing)];
  }

  const { easing, duration } = springTiming();
  const toHeight = panel.getBoundingClientRect().height;
  const sign = direction === "forward" ? 1 : -1;
  const rem = (px: number) => `${px / rootFontSize}rem`;

  const animations = [
    from.animate([{ transform: "translateX(0)" }, { transform: `translateX(${-SHIFT * sign}%)` }], { duration, easing, fill: "both" }),
    from.animate([{ opacity: 1, offset: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 0, offset: 1 }], { duration, fill: "both" }),
    to.animate([{ transform: `translateX(${SHIFT * sign}%)` }, { transform: "translateX(0)" }], { duration, easing }),
    to.animate(
      [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: 0.3 },
        { opacity: 1, offset: 0.7 },
        { opacity: 1, offset: 1 },
      ],
      { duration },
    ),
  ];
  if (Math.abs(toHeight - fromHeight) > 0.5) {
    animations.push(panel.animate([{ height: rem(fromHeight) }, { height: rem(toHeight) }], { duration, easing }));
  }
  return animations;
}
