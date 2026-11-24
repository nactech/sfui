/**
 * The TabBar "Pill": one shared selection indicator that travels between tabs.
 * Motion values come from final.pen → N/A3 "Tab bar / Motion" (SPEC, Android + Web column).
 * Pure DOM-free physics; the component feeds it measured anchor rects and paints its frames.
 */

export interface SpringConfig {
  /** Spring stiffness (mass 1). */
  stiffness: number;
  /** Damping ratio: 1 = critically damped (no overshoot), < 1 overshoots. */
  damping: number;
}

export const TAB_BAR_MOTION = {
  /** Tap travel: spring stiffness 700, damping 0.9 (≈ 260–320 ms). */
  tap: { stiffness: 700, damping: 0.9 } satisfies SpringConfig,
  /** Drag follow: spring 1400, damping 1.0 (no overshoot). */
  drag: { stiffness: 1400, damping: 1 } satisfies SpringConfig,
  /** Stretch: width × 1.4 mid-travel… */
  stretch: 1.4,
  /** …trailing edge lags 40 ms (the leading edge leads). */
  trailLagMs: 40,
  /** Storyboard B: the stretched pill thins from 32 to 30 (design px). */
  squash: 2 / 32,
  /** Icon tint cross-fades when the pill passes 50 % of its travel. */
  tintSwapAt: 0.5,
  /** Hold: pill → 62 × 36 (from 56 × 32), 120 ms ease-out. Deltas in design px. */
  holdMs: 120,
  holdGrow: { width: 6, height: 4 },
  /** Cancel: finger leaves the bar by more than 40 px → back to origin. */
  cancelDistance: 40,
  /** Horizontal travel before a press turns into a drag (px). */
  dragSlop: 6,
  /** Reduce motion: no stretch / overshoot / travel; 150 ms ease-out. */
  reducedMs: 150,
} as const;

/** Rect of a tab's anchor, relative to the bar's padding box, in px. */
export interface PillRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PillFrame extends PillRect {
  opacity: number;
}

export type PillMode = "idle" | "travel" | "drag";

export interface PillHost {
  /** Anchor rect of tab `index`, or null when it cannot be measured (hidden / not laid out). */
  measure: (index: number) => PillRect | null;
  count: () => number;
  isEnabled: (index: number) => boolean;
  /** Paint one frame. */
  render: (frame: PillFrame) => void;
  /** The tab that should look active right now (tint follows the pill, not the committed value). */
  indicate: (index: number) => void;
  reducedMotion: () => boolean;
  /** CSS px per design px (root font size / 16). */
  scale: () => number;
  now?: () => number;
  requestFrame?: (cb: () => void) => number;
  cancelFrame?: (id: number) => void;
}

interface Edge {
  pos: number;
  vel: number;
  target: number;
  startAt: number;
}

interface Tween {
  value: number;
  from: number;
  to: number;
  start: number;
  duration: number;
}

const STEP = 1 / 240;
const MAX_DT = 0.064;

/** Semi-implicit Euler step of a damped spring (mass 1). Mutates `edge`. */
export function stepSpring(edge: { pos: number; vel: number }, target: number, cfg: SpringConfig, dt: number) {
  const c = 2 * cfg.damping * Math.sqrt(cfg.stiffness);
  const acc = -cfg.stiffness * (edge.pos - target) - c * edge.vel;
  edge.vel += acc * dt;
  edge.pos += edge.vel * dt;
}

const easeOut = (p: number) => 1 - (1 - p) ** 3;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
// Perceptual rest: within half a pixel and nearly still, then snap. Gives the spec's ≈ 260–320 ms for 700 / 0.9.
const settled = (e: Edge) => Math.abs(e.pos - e.target) < 0.5 && Math.abs(e.vel) < 5;

export class PillMotion {
  mode: PillMode = "idle";
  /** Tab the pill rests on or travels to; -1 = hidden. */
  target = -1;

  private left: Edge = { pos: 0, vel: 0, target: 0, startAt: 0 };
  private right: Edge = { pos: 0, vel: 0, target: 0, startAt: 0 };
  private y = 0;
  private h = 0;
  private restW = 0;
  private stretchCap = Infinity;
  private leadRight = true;
  private fromCenter = 0;
  private toCenter = 0;
  private cfg: SpringConfig = TAB_BAR_MOTION.tap;
  private grow: Tween = { value: 0, from: 0, to: 0, start: 0, duration: 0 };
  private fade: Tween = { value: 0, from: 0, to: 0, start: 0, duration: 0 };
  private anchors: (PillRect | null)[] = [];
  private indicated = -1;
  private frame = 0;
  private last = 0;
  private host: PillHost;

  constructor(host: PillHost) {
    this.host = host;
  }

  private now() {
    return this.host.now ? this.host.now() : performance.now();
  }

  // ── public API ──────────────────────────────────────────────────────────

  /** Place the pill on `index` without animation (mount, resize, layout switch). */
  jumpTo(index: number) {
    this.stop();
    this.mode = "idle";
    this.target = index;
    const r = index >= 0 ? this.host.measure(index) : null;
    if (r) {
      this.setRest(r);
      this.left = { pos: r.x, vel: 0, target: r.x, startAt: 0 };
      this.right = { pos: r.x + r.w, vel: 0, target: r.x + r.w, startAt: 0 };
      this.fade = { value: 1, from: 1, to: 1, start: 0, duration: 0 };
    } else {
      this.fade = { value: 0, from: 0, to: 0, start: 0, duration: 0 };
    }
    this.setIndicated(index);
    this.paint();
    if (this.grow.value !== this.grow.to) this.run();
  }

  /** Keep the pill in sync with the committed value (no-op while dragging or already heading there). */
  sync(index: number) {
    if (this.mode === "drag" || index === this.target) return;
    this.travelTo(index);
  }

  /** Tap travel: spring + stretch toward `index`. */
  travelTo(index: number, opts: { lag?: boolean } = {}) {
    const r = index >= 0 ? this.host.measure(index) : null;
    const visible = this.fade.to > 0 && this.target >= 0;
    if (!r || !visible) {
      // Nothing to travel from (first selection) or to (deselect): appear / disappear in place.
      this.jumpTo(index);
      if (r) this.fadeIn();
      return;
    }
    if (this.host.reducedMotion()) {
      // Reduce motion: no travel, instant switch with a 150 ms ease-out fade-in at the new tab.
      this.jumpTo(index);
      this.fadeIn();
      return;
    }
    const now = this.now();
    const l = this.left.pos;
    const rr = this.right.pos;
    this.mode = "travel";
    this.target = index;
    this.cfg = TAB_BAR_MOTION.tap;
    this.fromCenter = (l + rr) / 2;
    this.toCenter = r.x + r.w / 2;
    this.leadRight = this.toCenter >= this.fromCenter;
    this.stretchCap = TAB_BAR_MOTION.stretch * Math.max(r.w, rr - l);
    this.setRest(r);
    const lag = opts.lag === false ? 0 : TAB_BAR_MOTION.trailLagMs;
    this.left.target = r.x;
    this.right.target = r.x + r.w;
    this.left.startAt = now + (this.leadRight ? lag : 0);
    this.right.startAt = now + (this.leadRight ? 0 : lag);
    if (Math.abs(this.toCenter - this.fromCenter) < 0.5) this.setIndicated(index);
    this.run();
  }

  /** Press-and-hold feedback: grow to 62 × 36 (design px) in 120 ms ease-out. */
  setHold(on: boolean) {
    const to = on ? 1 : 0;
    if (this.grow.to === to) return;
    if (this.host.reducedMotion()) {
      this.grow = { value: to, from: to, to, start: 0, duration: 0 };
      this.paint();
      return;
    }
    this.grow = { value: this.grow.value, from: this.grow.value, to, start: this.now(), duration: TAB_BAR_MOTION.holdMs };
    this.run();
  }

  startDrag(pointerX: number) {
    this.anchors = Array.from({ length: this.host.count() }, (_, i) => this.host.measure(i));
    if (this.fade.to === 0 || this.target < 0) {
      // No selection yet: appear under the finger.
      const n = this.nearestTo(pointerX, false);
      if (n >= 0) this.jumpTo(n);
    }
    this.mode = "drag";
    this.cfg = TAB_BAR_MOTION.drag;
    this.stretchCap = Infinity;
    this.setHold(true);
    this.dragTo(pointerX);
  }

  /** Pill centre follows the pointer (x in bar padding-box px), clamped to the first/last tab centres. */
  dragTo(pointerX: number) {
    if (this.mode !== "drag") return;
    const nearest = this.nearestTo(pointerX, false);
    const a = nearest >= 0 ? this.anchors[nearest] : null;
    if (!a) return;
    if (this.host.reducedMotion()) {
      // No travel: the pill jumps from tab to tab under the finger.
      this.left.pos = this.left.target = a.x;
      this.right.pos = this.right.target = a.x + a.w;
      this.left.vel = this.right.vel = 0;
      this.setRest(a);
      this.setIndicated(nearest);
      this.paint();
      return;
    }
    const centres = this.anchors.filter((r): r is PillRect => !!r).map((r) => r.x + r.w / 2);
    const cx = clamp(pointerX, Math.min(...centres), Math.max(...centres));
    const now = this.now();
    this.setRest(a);
    this.left.target = cx - a.w / 2;
    this.right.target = cx + a.w / 2;
    this.left.startAt = this.right.startAt = now;
    this.run();
  }

  /** Release: snap to `index` (nearest centre) with the tap spring. */
  endDrag(index: number) {
    this.mode = "idle";
    this.anchors = [];
    this.setHold(false);
    this.travelTo(index, { lag: false });
  }

  /** Cancel: back to origin (`index` = committed tab). */
  cancelDrag(index: number) {
    this.mode = "idle";
    this.anchors = [];
    this.setHold(false);
    this.travelTo(index);
  }

  /** Index of the tab whose centre is nearest to the pill centre. */
  nearest(enabledOnly: boolean) {
    return this.nearestTo((this.left.pos + this.right.pos) / 2, enabledOnly);
  }

  /** Re-measure after a resize / layout switch. */
  refresh() {
    if (this.mode === "drag") {
      this.anchors = Array.from({ length: this.host.count() }, (_, i) => this.host.measure(i));
      return;
    }
    if (this.mode === "travel") {
      const r = this.host.measure(this.target);
      if (!r) return this.jumpTo(this.target);
      this.setRest(r);
      this.left.target = r.x;
      this.right.target = r.x + r.w;
      this.toCenter = r.x + r.w / 2;
      this.run();
      return;
    }
    this.jumpTo(this.target);
  }

  destroy() {
    this.stop();
  }

  // ── internals ───────────────────────────────────────────────────────────

  private setRest(r: PillRect) {
    this.y = r.y;
    this.h = r.h;
    this.restW = r.w;
  }

  private fadeIn() {
    this.fade = { value: 0, from: 0, to: 1, start: this.now(), duration: TAB_BAR_MOTION.reducedMs };
    this.paint();
    this.run();
  }

  private nearestTo(x: number, enabledOnly: boolean) {
    const anchors = this.anchors.length ? this.anchors : Array.from({ length: this.host.count() }, (_, i) => this.host.measure(i));
    let best = -1;
    let bestD = Infinity;
    anchors.forEach((r, i) => {
      if (!r || (enabledOnly && !this.host.isEnabled(i))) return;
      const d = Math.abs(r.x + r.w / 2 - x);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }

  private setIndicated(index: number) {
    if (index === this.indicated) return;
    this.indicated = index;
    this.host.indicate(index);
  }

  private run() {
    if (this.frame) return;
    this.last = this.now();
    const raf = this.host.requestFrame ?? requestAnimationFrame;
    this.frame = raf(this.tick);
  }

  private stop() {
    if (!this.frame) return;
    (this.host.cancelFrame ?? cancelAnimationFrame)(this.frame);
    this.frame = 0;
  }

  private tick = () => {
    this.frame = 0;
    const now = this.now();
    const dt = clamp((now - this.last) / 1000, 0, MAX_DT);
    this.last = now;

    const steps = Math.max(1, Math.ceil(dt / STEP));
    const h = dt / steps;
    for (const edge of [this.left, this.right]) {
      if (now < edge.startAt) continue;
      for (let i = 0; i < steps; i++) stepSpring(edge, edge.target, this.cfg, h);
    }
    for (const t of [this.grow, this.fade]) {
      if (t.duration <= 0) {
        t.value = t.to;
        continue;
      }
      const p = clamp((now - t.start) / t.duration, 0, 1);
      t.value = t.from + (t.to - t.from) * easeOut(p);
    }

    const edgesDone = settled(this.left) && settled(this.right) && now >= this.left.startAt && now >= this.right.startAt;
    const tweensDone = this.grow.value === this.grow.to && this.fade.value === this.fade.to;

    if (this.mode === "travel" && edgesDone) {
      this.left.pos = this.left.target;
      this.right.pos = this.right.target;
      this.left.vel = this.right.vel = 0;
      this.mode = "idle";
      this.setIndicated(this.target);
    }
    this.paint();
    if (!(edgesDone && tweensDone)) {
      const raf = this.host.requestFrame ?? requestAnimationFrame;
      this.frame = raf(this.tick);
    }
  };

  private paint() {
    let l = this.left.pos;
    let r = this.right.pos;
    if (this.mode === "travel") {
      // Stretch, capped at × 1.4: the leading edge leads, the trailing edge is pulled along.
      if (r - l > this.stretchCap) {
        if (this.leadRight) l = r - this.stretchCap;
        else r = l + this.stretchCap;
      }
      const centre = (l + r) / 2;
      const span = this.toCenter - this.fromCenter;
      if (span !== 0 && (centre - this.fromCenter) / span >= TAB_BAR_MOTION.tintSwapAt) this.setIndicated(this.target);
    } else if (this.mode === "drag") {
      this.setIndicated(this.nearestTo((l + r) / 2, false));
    }
    const w = Math.max(0, r - l);
    const stretch = this.restW > 0 ? clamp((w - this.restW) / (this.restW * (TAB_BAR_MOTION.stretch - 1)), 0, 1) : 0;
    const squashedH = this.h * (1 - TAB_BAR_MOTION.squash * stretch);
    const k = this.host.scale();
    const gw = TAB_BAR_MOTION.holdGrow.width * k * this.grow.value;
    const gh = TAB_BAR_MOTION.holdGrow.height * k * this.grow.value;
    this.host.render({
      x: l - gw / 2,
      y: this.y + (this.h - squashedH) / 2 - gh / 2,
      w: w + gw,
      h: squashedH + gh,
      opacity: this.fade.value,
    });
  }
}
