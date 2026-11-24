import { PillMotion, TAB_BAR_MOTION, stepSpring, type PillFrame, type PillHost, type PillRect } from "./pillMotion";

// Compact master geometry: 4 tabs, indicator 56 × 32 at x = 12.5 + 81·i, y = 10.
const rect = (i: number): PillRect => ({ x: 12.5 + 81 * i, y: 10, w: 56, h: 32 });

function setup(opts: { reduced?: boolean } = {}) {
  let t = 0;
  const queue: (() => void)[] = [];
  const frames: PillFrame[] = [];
  const indicated: number[] = [];
  const host: PillHost = {
    measure: (i) => (i >= 0 && i < 4 ? rect(i) : null),
    count: () => 4,
    isEnabled: () => true,
    render: (f) => frames.push(f),
    indicate: (i) => indicated.push(i),
    reducedMotion: () => !!opts.reduced,
    scale: () => 1,
    now: () => t,
    requestFrame: (cb) => queue.push(cb),
    cancelFrame: () => {
      queue.length = 0;
    },
  };
  const motion = new PillMotion(host);
  /** Advance the clock in 16 ms frames. */
  const advance = (ms: number) => {
    for (let elapsed = 0; elapsed < ms; elapsed += 16) {
      t += 16;
      const cbs = queue.splice(0);
      cbs.forEach((cb) => cb());
    }
  };
  const last = () => frames[frames.length - 1];
  return { motion, advance, frames, indicated, last, now: () => t };
}

describe("stepSpring", () => {
  test("critically damped drag spring (1400 / 1.0) never overshoots", () => {
    const e = { pos: 0, vel: 0 };
    let max = 0;
    for (let i = 0; i < 240; i++) {
      stepSpring(e, 100, TAB_BAR_MOTION.drag, 1 / 240);
      max = Math.max(max, e.pos);
    }
    expect(max).toBeLessThanOrEqual(100);
    expect(e.pos).toBeCloseTo(100, 0);
  });
});

describe("PillMotion", () => {
  test("jumpTo places the pill on the anchor without animation", () => {
    const { motion, last, indicated } = setup();
    motion.jumpTo(1);
    expect(last()).toEqual({ ...rect(1), opacity: 1 });
    expect(indicated).toEqual([1]);
    expect(motion.mode).toBe("idle");
  });

  test("tap travel: spring 700 / 0.9 settles in ≈ 260–320 ms, stretches ≤ × 1.4, tint swaps mid-travel", () => {
    const { motion, advance, frames, indicated, last } = setup();
    motion.jumpTo(0);
    frames.length = 0;
    motion.travelTo(2);
    expect(motion.mode).toBe("travel");

    let settledAt = -1;
    for (let ms = 16; ms <= 600; ms += 16) {
      advance(16);
      if (motion.mode === "idle" && settledAt < 0) settledAt = ms;
    }
    // Spec: ≈ 260–320 ms (±1 frame).
    expect(settledAt).toBeGreaterThanOrEqual(240);
    expect(settledAt).toBeLessThanOrEqual(336);

    const widest = Math.max(...frames.map((f) => f.w));
    expect(widest).toBeGreaterThan(56 * 1.2);
    expect(widest).toBeLessThanOrEqual(56 * 1.4 + 0.01);
    // Thinner while stretched (storyboard B: 32 → 30).
    expect(Math.min(...frames.map((f) => f.h))).toBeLessThan(32);

    // Tint follows the pill: Export became active only once the pill passed half of the travel.
    const swapFrame = frames.findIndex((f) => f.x + f.w / 2 >= (rect(0).x + 28 + rect(2).x + 28) / 2);
    expect(swapFrame).toBeGreaterThan(0);
    expect(indicated).toEqual([0, 2]);

    expect(last()).toEqual({ ...rect(2), opacity: 1 });
  });

  test("the leading edge leads, the trailing edge lags 40 ms", () => {
    const { motion, advance, last } = setup();
    motion.jumpTo(0);
    motion.travelTo(3);
    advance(32); // < 40 ms: the right (leading) edge runs ahead, the left one is only pulled by the × 1.4 cap
    const leftMoved = last().x - rect(0).x;
    const rightMoved = last().x + last().w - (rect(0).x + 56);
    expect(rightMoved).toBeGreaterThan(0);
    expect(leftMoved).toBeLessThan(rightMoved);
    expect(last().w).toBeCloseTo(56 * 1.4, 5);
  });

  test("hold grows the pill to 62 × 36 in 120 ms", () => {
    const { motion, advance, last } = setup();
    motion.jumpTo(0);
    motion.setHold(true);
    advance(128);
    expect(last().w).toBeCloseTo(62, 5);
    expect(last().h).toBeCloseTo(36, 5);
    // Grows around its centre.
    expect(last().x + last().w / 2).toBeCloseTo(rect(0).x + 28, 5);
  });

  test("drag: follows the pointer, clamps to the outer tabs, snaps to the nearest centre on release", () => {
    const { motion, advance, last, indicated } = setup();
    motion.jumpTo(0);
    motion.startDrag(40);
    motion.dragTo(150);
    advance(400);
    expect(last().x + last().w / 2).toBeCloseTo(150, 0);
    expect(indicated[indicated.length - 1]).toBe(1); // centre 121.5 is nearer than 202.5

    motion.dragTo(1000); // way past the last tab: clamped to its centre
    advance(400);
    expect(last().x + last().w / 2).toBeCloseTo(rect(3).x + 28, 0);

    motion.dragTo(190);
    advance(400);
    const target = motion.nearest(true);
    expect(target).toBe(2);
    motion.endDrag(target);
    advance(600);
    expect(last()).toEqual({ ...rect(2), opacity: 1 });
  });

  test("cancel returns to the origin tab", () => {
    const { motion, advance, last } = setup();
    motion.jumpTo(1);
    motion.startDrag(121);
    motion.dragTo(280);
    advance(200);
    motion.cancelDrag(1);
    advance(600);
    expect(last()).toEqual({ ...rect(1), opacity: 1 });
  });

  test("reduced motion: no travel or stretch, instant switch with a 150 ms fade-in", () => {
    const { motion, advance, frames, last } = setup({ reduced: true });
    motion.jumpTo(0);
    frames.length = 0;
    motion.travelTo(3);
    expect(frames.every((f) => f.x === rect(3).x && f.w === 56)).toBe(true);
    expect(last().opacity).toBe(0);
    advance(160);
    expect(last().opacity).toBe(1);
  });
});
